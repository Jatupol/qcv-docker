// client/src/pages/masterdata/DefectImageManagementPage.tsx
/**
 * Defect Image Management Page
 * Admin-only page for managing defect_image and defect_customer_image tables
 * Features:
 * - View images from both tables in one page
 * - Optimize existing images with client-side optimization (2048px max, 92% quality)
 * - Bulk optimize multiple images with progress tracking
 * - Preview images
 * - Statistics and monitoring
 */

import { useState, useEffect } from 'react';
import { message, Card, Tabs, Table, Image, Button, Space, Modal, Spin, Tag, Statistic, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import {
  PhotoIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowsPointingInIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  optimizeImage,
  formatFileSize,
  DEFAULT_IMAGE_OPTIONS,
  type OptimizationResult
} from '../../utils/imageOptimizer';
import defectImageService, { type DefectImageRecord } from '../../services/defectImageService';
import axios from 'axios';
import { buildApiUrl } from '../../services/api';

const { TabPane } = Tabs;

// ==================== TYPES ====================

interface ImageData {
  id: number;
  defect_id: number;
  image_url?: string;
  image_size?: number;
  image_dimensions?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert relative image URL to full URL using centralized API configuration
 * This ensures images display correctly in both development and production
 */
function getImageUrl(relativeUrl: string): string {
  return buildApiUrl(relativeUrl);
}

/**
 * Fetch image blob using axios with proper authentication and API URL
 * This ensures the request goes to the correct backend server with session cookies
 */
async function fetchImageBlob(imageUrl: string): Promise<Blob> {
  // Build the full API URL using the centralized configuration
  const fullUrl = buildApiUrl(imageUrl);

  console.log('📥 Fetching image from:', fullUrl);

  // Use axios with credentials to fetch the image as a blob
  const response = await axios.get(fullUrl, {
    responseType: 'blob',
    withCredentials: true
  });

  console.log('📥 Downloaded image:', {
    size: formatFileSize(response.data.size),
    type: response.data.type
  });

  return response.data;
}

// ==================== MAIN COMPONENT ====================

export default function DefectImageManagementPage() {
  const [activeTab, setActiveTab] = useState<'regular' | 'customer'>('regular');
  const [regularImages, setRegularImages] = useState<ImageData[]>([]);
  const [customerImages, setCustomerImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizingId, setOptimizingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Bulk optimization states
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkOptimizing, setBulkOptimizing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<{ success: number; failed: number; totalReduction: number }>({
    success: 0,
    failed: 0,
    totalReduction: 0
  });

  // Statistics
  const [stats, setStats] = useState({
    regular: { total: 0, totalSize: 0 },
    customer: { total: 0, totalSize: 0 }
  });

  // ==================== DATA LOADING ====================

  useEffect(() => {
    loadImages();
    setSelectedRowKeys([]); // Clear selection when switching tabs
  }, [activeTab]);

  const loadImages = async () => {
    setLoading(true);
    try {
      if (activeTab === 'regular') {
        const data = await defectImageService.getDefectImages();
        setRegularImages(data);
        calculateStats(data, 'regular');
      } else {
        const data = await defectImageService.getCustomerDefectImages();
        setCustomerImages(data);
        calculateStats(data, 'customer');
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      message.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ImageData[], type: 'regular' | 'customer') => {
    const totalSize = data.reduce((sum, item) => sum + (item.image_size || 0), 0);
    setStats(prev => ({
      ...prev,
      [type]: {
        total: data.length,
        totalSize
      }
    }));
  };

  // ==================== IMAGE OPERATIONS ====================

  const handleOptimizeImage = async (record: ImageData) => {
    if (!record.image_url) {
      message.warning('No image to optimize');
      return;
    }

    Modal.confirm({
      title: 'Optimize Image',
      content: 'This will re-optimize the existing image (2048px max, 92% quality) and update it in the database. Continue?',
      okText: 'Optimize',
      onOk: async () => {
        setOptimizing(true);
        setOptimizingId(record.id);
        try {
          console.log('📸 Starting optimization for image ID:', record.id);

          // Fetch the image from the server using axios with proper authentication
          const imageBlob = await fetchImageBlob(record.image_url!);
          const imageFile = new File([imageBlob], `image_${record.id}.jpg`, { type: 'image/jpeg' });

          // Optimize image using client-side utility
          const result: OptimizationResult = await optimizeImage(imageFile, DEFAULT_IMAGE_OPTIONS);

          console.log('✅ Optimization complete:', {
            wasOptimized: result.wasOptimized,
            originalSize: formatFileSize(result.metadata.originalSize),
            optimizedSize: formatFileSize(result.metadata.optimizedSize),
            reduction: `${result.metadata.reduction.toFixed(1)}%`
          });

          // Show optimization results
          Modal.info({
            title: 'Image Optimization Results',
            content: (
              <div>
                <p><strong>Record ID:</strong> {record.id}</p>
                <p><strong>Defect ID:</strong> {record.defect_id}</p>
                <p><strong>Original:</strong> {result.metadata.originalWidth} x {result.metadata.originalHeight} ({formatFileSize(result.metadata.originalSize)})</p>
                <p><strong>Optimized:</strong> {result.metadata.optimizedWidth} x {result.metadata.optimizedHeight} ({formatFileSize(result.metadata.optimizedSize)})</p>
                <p><strong>Size Reduction:</strong> {result.metadata.reduction.toFixed(1)}%</p>
                <p style={{ marginTop: 16, color: '#52c41a' }}>
                  ✅ Image optimized successfully! Uploading to server...
                </p>
              </div>
            )
          });

          // Update the existing image record with optimized version
          await defectImageService.updateImage(record.id, result.file, activeTab);

          message.success('Image optimized and updated successfully!');
          loadImages(); // Reload data

        } catch (error) {
          console.error('Failed to optimize image:', error);
          message.error('Failed to optimize image');
        } finally {
          setOptimizing(false);
          setOptimizingId(null);
        }
      }
    });
  };

  const handlePreview = (record: ImageData) => {
    setSelectedImage(record);
    setPreviewVisible(true);
  };

  // ==================== BULK OPTIMIZATION ====================

  const handleBulkOptimize = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select images to optimize');
      return;
    }

    const currentImages = activeTab === 'regular' ? regularImages : customerImages;
    const selectedImages = currentImages.filter(img =>
      selectedRowKeys.includes(img.id) && img.image_url
    );

    if (selectedImages.length === 0) {
      message.warning('No valid images selected');
      return;
    }

    Modal.confirm({
      title: 'Bulk Optimize Images',
      content: `Are you sure you want to optimize ${selectedImages.length} images? This may take some time.`,
      okText: 'Start Optimization',
      width: 500,
      onOk: async () => {
        setBulkOptimizing(true);
        setBulkProgress({ current: 0, total: selectedImages.length });
        setBulkResults({ success: 0, failed: 0, totalReduction: 0 });

        let successCount = 0;
        let failedCount = 0;
        let totalReduction = 0;

        for (let i = 0; i < selectedImages.length; i++) {
          const record = selectedImages[i];
          setBulkProgress({ current: i + 1, total: selectedImages.length });

          try {
            console.log(`📸 [${i + 1}/${selectedImages.length}] Optimizing image ID: ${record.id}`);

            // Fetch the image from the server using axios with proper authentication
            const imageBlob = await fetchImageBlob(record.image_url!);
            const imageFile = new File([imageBlob], `image_${record.id}.jpg`, { type: 'image/jpeg' });

            // Optimize image
            const result: OptimizationResult = await optimizeImage(imageFile, DEFAULT_IMAGE_OPTIONS);

            console.log(`✅ [${i + 1}/${selectedImages.length}] Optimized:`, {
              id: record.id,
              reduction: `${result.metadata.reduction.toFixed(1)}%`
            });

            // Update the existing image record
            await defectImageService.updateImage(record.id, result.file, activeTab);

            successCount++;
            totalReduction += result.metadata.reduction;

          } catch (error) {
            console.error(`❌ [${i + 1}/${selectedImages.length}] Failed to optimize image ID ${record.id}:`, error);
            failedCount++;
          }

          // Update results in real-time
          setBulkResults({
            success: successCount,
            failed: failedCount,
            totalReduction: totalReduction
          });
        }

        // Show completion modal
        Modal.success({
          title: 'Bulk Optimization Complete',
          width: 600,
          content: (
            <div>
              <p><strong>Total Images:</strong> {selectedImages.length}</p>
              <p style={{ color: '#52c41a' }}><strong>Successful:</strong> {successCount}</p>
              {failedCount > 0 && (
                <p style={{ color: '#ff4d4f' }}><strong>Failed:</strong> {failedCount}</p>
              )}
              {successCount > 0 && (
                <p><strong>Average Size Reduction:</strong> {(totalReduction / successCount).toFixed(1)}%</p>
              )}
            </div>
          )
        });

        setBulkOptimizing(false);
        setBulkProgress({ current: 0, total: 0 });
        setSelectedRowKeys([]);
        loadImages(); // Reload data
      }
    });
  };

  const handleSelectAll = () => {
    const currentImages = activeTab === 'regular' ? regularImages : customerImages;
    const validIds = currentImages.filter(img => img.image_url).map(img => img.id);
    setSelectedRowKeys(validIds);
  };

  const handleDeselectAll = () => {
    setSelectedRowKeys([]);
  };

  // ==================== TABLE COLUMNS ====================

  const columns: ColumnsType<ImageData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Defect ID',
      dataIndex: 'defect_id',
      key: 'defect_id',
      width: 120,
      sorter: (a, b) => a.defect_id - b.defect_id,
    },
    {
      title: 'Preview',
      key: 'preview',
      width: 120,
      render: (_, record) => (
        record.image_url ? (
          <Image
            width={80}
            height={60}
            src={getImageUrl(record.image_url)}
            alt={`Defect ${record.defect_id}`}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={false}
          />
        ) : (
          <Tag color="default">No Image</Tag>
        )
      ),
    },
    {
      title: 'Dimensions',
      dataIndex: 'image_dimensions',
      key: 'image_dimensions',
      width: 150,
      render: (dims) => dims || '-',
    },
    {
      title: 'Size',
      dataIndex: 'image_size',
      key: 'image_size',
      width: 120,
      sorter: (a, b) => (a.image_size || 0) - (b.image_size || 0),
      render: (size) => size ? formatFileSize(size) : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          {record.image_url ? (
            <>
              <Button
                type="link"
                icon={<EyeIcon className="w-4 h-4" />}
                onClick={() => handlePreview(record)}
                disabled={optimizing}
              >
                View
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<ArrowsPointingInIcon className="w-4 h-4" />}
                onClick={() => handleOptimizeImage(record)}
                loading={optimizingId === record.id}
                disabled={optimizing && optimizingId !== record.id}
              >
                Optimize
              </Button>
            </>
          ) : (
            <Tag color="default">No Image</Tag>
          )}
        </Space>
      ),
    },
  ];

  // ==================== RENDER ====================

  const currentImages = activeTab === 'regular' ? regularImages : customerImages;
  const currentStats = stats[activeTab];

  // Row selection configuration
  const rowSelection: TableRowSelection<ImageData> = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
    getCheckboxProps: (record) => ({
      disabled: !record.image_url || optimizing || bulkOptimizing,
    }),
  };

  return (
    <div className="defect-image-management-page">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PhotoIcon className="w-6 h-6" style={{ color: '#1890ff' }} />
            <span>Defect Image Management</span>
          </div>
        }
        extra={
          <Space>
            {selectedRowKeys.length > 0 && (
              <>
                <Tag color="blue">{selectedRowKeys.length} selected</Tag>
                <Button
                  type="primary"
                  icon={<ArrowsPointingInIcon className="w-4 h-4" />}
                  onClick={handleBulkOptimize}
                  disabled={loading || optimizing || bulkOptimizing}
                >
                  Bulk Optimize
                </Button>
                <Button
                  onClick={handleDeselectAll}
                  disabled={loading || optimizing || bulkOptimizing}
                >
                  Clear Selection
                </Button>
              </>
            )}
            {selectedRowKeys.length === 0 && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleSelectAll}
                disabled={loading || optimizing || bulkOptimizing || currentImages.filter(img => img.image_url).length === 0}
              >
                Select All
              </Button>
            )}
            <Button
              icon={<ArrowPathIcon className="w-4 h-4" />}
              onClick={loadImages}
              loading={loading}
              disabled={optimizing || bulkOptimizing}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        {/* Statistics */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 24 }}>
          <Card size="small">
            <Statistic
              title="Total Images"
              value={currentStats.total}
              prefix={<PhotoIcon className="w-5 h-5" />}
            />
          </Card>
          <Card size="small">
            <Statistic
              title="Total Size"
              value={formatFileSize(currentStats.totalSize)}
              prefix={<ArrowsPointingInIcon className="w-5 h-5" />}
            />
          </Card>
        </div>

        {/* Info Banner */}
        <div style={{
          marginBottom: 16,
          padding: 12,
          background: '#e6f7ff',
          borderLeft: '3px solid #1890ff',
          borderRadius: 4
        }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <InformationCircleIcon className="w-5 h-5" style={{ color: '#1890ff' }} />
              <span>
                Click "Optimize" on any image to re-optimize it (2048px max, 92% quality).
                This reduces file size while maintaining excellent visual quality.
              </span>
            </Space>
            <Space>
              <CheckCircleIcon className="w-5 h-5" style={{ color: '#1890ff' }} />
              <span>
                Use checkboxes to select multiple images and click "Bulk Optimize" to optimize them all at once.
              </span>
            </Space>
          </Space>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => !optimizing && setActiveTab(key as 'regular' | 'customer')}
        >
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <PhotoIcon className="w-4 h-4" />
                Regular Defect Images ({stats.regular.total})
              </span>
            }
            key="regular"
          >
            <Table
              columns={columns}
              dataSource={regularImages}
              rowKey="id"
              rowSelection={rowSelection}
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} images`,
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <PhotoIcon className="w-4 h-4" />
                Customer Defect Images ({stats.customer.total})
              </span>
            }
            key="customer"
          >
            <Table
              columns={columns}
              dataSource={customerImages}
              rowKey="id"
              rowSelection={rowSelection}
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} images`,
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={`Defect Image - ID: ${selectedImage?.id}`}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        {selectedImage?.image_url && (
          <div>
            <Image
              src={getImageUrl(selectedImage.image_url)}
              alt={`Defect ${selectedImage.defect_id}`}
              style={{ width: '100%' }}
            />
            <div style={{ marginTop: 16 }}>
              <p><strong>Defect ID:</strong> {selectedImage.defect_id}</p>
              <p><strong>Dimensions:</strong> {selectedImage.image_dimensions}</p>
              <p><strong>Size:</strong> {selectedImage.image_size ? formatFileSize(selectedImage.image_size) : 'Unknown'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Loading Overlay - Single Image */}
      {optimizing && !bulkOptimizing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Spin size="large" tip="Optimizing image..." />
        </div>
      )}

      {/* Loading Overlay - Bulk Optimization */}
      {bulkOptimizing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Card style={{ width: 500, textAlign: 'center' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Spin size="large" />
              <h3>Bulk Optimizing Images</h3>
              <Progress
                percent={Math.round((bulkProgress.current / bulkProgress.total) * 100)}
                status="active"
              />
              <p>
                Processing: {bulkProgress.current} / {bulkProgress.total}
              </p>
              <div style={{ marginTop: 16, textAlign: 'left' }}>
                <p><strong>Success:</strong> <span style={{ color: '#52c41a' }}>{bulkResults.success}</span></p>
                <p><strong>Failed:</strong> <span style={{ color: '#ff4d4f' }}>{bulkResults.failed}</span></p>
                {bulkResults.success > 0 && (
                  <p><strong>Avg. Reduction:</strong> {(bulkResults.totalReduction / bulkResults.success).toFixed(1)}%</p>
                )}
              </div>
            </Space>
          </Card>
        </div>
      )}
    </div>
  );
}
