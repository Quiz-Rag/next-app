"use client";

import React, { useState, useEffect } from "react";
import { uploadDocument, uploadDocumentBatch, getJobStatus } from "../../lib/api";
import { Upload, FileText, Check, X, Loader2, Trash2 } from "lucide-react";

export default function TrainDBPage() {
  const [files, setFiles] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file count (1-30)
    if (selectedFiles.length > 30) {
      setError("Maximum 30 files allowed per batch. Please select fewer files.");
      return;
    }
    
    setFiles(selectedFiles);
    setError(null);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file!");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let result;
      if (files.length === 1) {
        // Single file upload
        result = await uploadDocument(files[0]);
      } else {
        // Batch upload (2-10 files)
        result = await uploadDocumentBatch(files);
      }
      setJobId(result.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    let isActive = true;

    const pollStatus = async () => {
      try {
        const jobData = await getJobStatus(jobId);

        if (isActive) {
          setJob(jobData);

          // Stop polling if completed or failed
          if (
            jobData.status === "completed" || 
            jobData.status === "failed" ||
            jobData.status === "partially_completed"
          ) {
            isActive = false;
            return;
          }

          // Continue polling every 2 seconds
          setTimeout(pollStatus, 2000);
        }
      } catch (err) {
        console.error("Error polling status:", err);
        if (isActive) {
          // Retry polling even on error
          setTimeout(pollStatus, 2000);
        }
      }
    };

    pollStatus();

    return () => {
      isActive = false;
    };
  }, [jobId]);

  // Reset form
  const handleReset = () => {
    setJobId(null);
    setJob(null);
    setFiles([]);
    setError(null);
  };

  const isBatchJob = job && job.is_batch;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      padding: '3rem 1.5rem'
    }}>
      <div style={{ 
        maxWidth: '48rem', 
        margin: '0 auto' 
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Train Database
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: '2rem'
        }}>
          Upload PDF or PPTX files (1-10 files) to create embeddings for AI-powered quiz generation
        </p>

        {!jobId ? (
          // Upload Form
          <div style={{ 
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            {/* File Upload Area */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                Select Files (PDF or PPTX) <span style={{ color: 'var(--accent-danger)' }}>*</span>
              </label>
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '0.5rem',
                padding: '2rem',
                textAlign: 'center',
                background: 'var(--bg-dark)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'var(--bg-dark)';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'var(--bg-dark)';
                const droppedFiles = Array.from(e.dataTransfer.files);
                
                // Validate file count (1-30)
                if (droppedFiles.length > 30) {
                  setError("Maximum 30 files allowed per batch. Please select fewer files.");
                  return;
                }
                
                setFiles(droppedFiles);
                setError(null);
              }}>
                <input
                  type="file"
                  accept=".pdf,.pptx"
                  multiple
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <Upload style={{ 
                  width: '3rem', 
                  height: '3rem',
                  margin: '0 auto 1rem',
                  color: 'var(--accent-primary)'
                }} />
                <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {files.length > 0 ? `${files.length} file(s) selected` : 'Drop your files here or click to browse'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Upload 1-30 files • PDF or PPTX • Max 50MB per file
                </p>
              </div>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'var(--bg-dark)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)'
              }}>
                <p style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)'
                }}>
                  Selected Files ({files.length}/30):
                </p>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {files.map((file, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--bg-card)',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-primary)' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{file.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        style={{
                          padding: '0.375rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--accent-danger)',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: files.length > 0 && !uploading ? 
                  'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 
                  'var(--border-color)',
                color: 'white',
                fontWeight: '600',
                border: 'none',
                cursor: files.length > 0 && !uploading ? 'pointer' : 'not-allowed',
                opacity: files.length > 0 && !uploading ? 1 : 0.5,
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {uploading ? (
                <>
                  <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload style={{ width: '1.25rem', height: '1.25rem' }} />
                  Upload {files.length} File{files.length !== 1 ? 's' : ''} & Process
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--accent-danger)',
                color: 'var(--accent-danger)',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
          </div>
        ) : (
          // Job Status Display
          <div style={{ 
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Job ID */}
            <div style={{
              padding: '1rem',
              background: 'var(--bg-dark)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Job ID:
              </p>
              <p style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                wordBreak: 'break-all'
              }}>
                {jobId}
              </p>
            </div>

            {job && (
              <>
                {/* Status Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                    {isBatchJob ? 'Batch Status:' : 'Status:'}
                  </span>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: 
                      job.status === "completed" ? 'rgba(16, 185, 129, 0.2)' :
                      job.status === "failed" ? 'rgba(239, 68, 68, 0.2)' :
                      job.status === "processing" ? 'rgba(0, 217, 255, 0.2)' :
                      job.status === "partially_completed" ? 'rgba(245, 158, 11, 0.2)' :
                      'rgba(148, 163, 184, 0.2)',
                    color:
                      job.status === "completed" ? 'var(--accent-success)' :
                      job.status === "failed" ? 'var(--accent-danger)' :
                      job.status === "processing" ? 'var(--accent-primary)' :
                      job.status === "partially_completed" ? 'var(--accent-warning)' :
                      'var(--text-secondary)'
                  }}>
                    {job.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                {/* Batch Progress - Overall */}
                {isBatchJob && job.status === 'processing' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: 'var(--text-primary)' }}>
                        Processing {job.processed_files} of {job.total_files} files
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
                        {job.overall_progress?.toFixed(0) || 0}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '0.75rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease',
                        width: `${job.overall_progress || 0}%`,
                        boxShadow: '0 0 10px var(--glow-primary)'
                      }} />
                    </div>
                  </div>
                )}

                {/* Current File Info (Single) */}
                {!isBatchJob && job.file_name && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: 'var(--bg-dark)',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <FileText style={{ width: '2rem', height: '2rem', color: 'var(--accent-primary)' }} />
                    <div>
                      <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{job.file_name}</p>
                    </div>
                  </div>
                )}

                {/* Current File Progress (Batch) */}
                {isBatchJob && job.current_file && job.current_file_progress && (
                  <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(0, 217, 255, 0.1)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: '0.5rem'
                  }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--accent-primary)',
                      marginBottom: '0.5rem'
                    }}>
                      Currently: {job.current_file}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                      <p style={{ textTransform: 'capitalize' }}>
                        {job.current_file_progress.current_step.replace(/_/g, ' ')}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '0.25rem'
                      }}>
                        <span>
                          Chunks: {job.current_file_progress.chunks_processed} / {job.current_file_progress.total_chunks}
                        </span>
                        <span>{job.current_file_progress.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Single File Progress Bar */}
                {!isBatchJob && job.progress && job.status !== "completed" && job.status !== "failed" && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {job.progress.current_step.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
                        {job.progress.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '0.75rem',
                      background: 'var(--bg-dark)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease',
                        width: `${job.progress.percentage}%`,
                        boxShadow: '0 0 10px var(--glow-primary)'
                      }} />
                    </div>
                    {job.progress.total_chunks > 0 && (
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.5rem'
                      }}>
                        Processing: {job.progress.chunks_processed} / {job.progress.total_chunks} chunks
                      </p>
                    )}
                  </div>
                )}

                {/* Individual Files List (Batch) */}
                {isBatchJob && job.files && job.files.length > 0 && (
                  <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'var(--bg-dark)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <h3 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      marginBottom: '0.75rem',
                      color: 'var(--text-primary)'
                    }}>
                      Files ({job.files.length}):
                    </h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {job.files.map((file, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          background: 'var(--bg-card)',
                          borderRadius: '0.375rem',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                              {file.name}
                            </p>
                            {file.error && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: '0.25rem' }}>
                                {file.error}
                              </p>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {file.chunks > 0 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {file.chunks} chunks
                              </span>
                            )}
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background:
                                file.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' :
                                file.status === 'failed' ? 'rgba(239, 68, 68, 0.2)' :
                                file.status === 'processing' ? 'rgba(0, 217, 255, 0.2)' :
                                'rgba(148, 163, 184, 0.2)',
                              color:
                                file.status === 'completed' ? 'var(--accent-success)' :
                                file.status === 'failed' ? 'var(--accent-danger)' :
                                file.status === 'processing' ? 'var(--accent-primary)' :
                                'var(--text-secondary)'
                            }}>
                              {file.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {(job.status === "completed" || job.status === "partially_completed") && job.metadata && (
                  <div style={{
                    padding: '1.5rem',
                    background: job.status === "completed" ? 
                      'rgba(16, 185, 129, 0.1)' : 
                      'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${job.status === "completed" ? 'var(--accent-success)' : 'var(--accent-warning)'}`,
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{
                      color: job.status === "completed" ? 'var(--accent-success)' : 'var(--accent-warning)',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {job.status === "completed" ? (
                        <>
                          <Check style={{ width: '1.25rem', height: '1.25rem' }} />
                          {isBatchJob ? 'All Files Processed!' : 'Processing Complete!'}
                        </>
                      ) : (
                        <>
                          ⚠ Partially Completed
                        </>
                      )}
                    </p>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      display: 'grid',
                      gap: '0.5rem'
                    }}>
                      {isBatchJob ? (
                        <>
                          <p>• Successful files: <strong>{job.metadata.successful_files}</strong></p>
                          {job.metadata.failed_files > 0 && (
                            <p>• Failed files: <strong>{job.metadata.failed_files}</strong></p>
                          )}
                          <p>• Total chunks: <strong>{job.metadata.total_chunks}</strong></p>
                          <p>• Text length: <strong>{job.metadata.total_text_length?.toLocaleString() || 'N/A'}</strong> characters</p>
                          <p>• Processing time: <strong>{job.metadata.processing_time_seconds?.toFixed(1) || 'N/A'}s</strong></p>
                        </>
                      ) : (
                        <>
                          <p>• Chunks created: <strong>{job.metadata.chunks_count}</strong></p>
                          <p>• Text length: <strong>{job.metadata.text_length?.toLocaleString() || 'N/A'}</strong> characters</p>
                          <p>• Processing time: <strong>{job.metadata.processing_time_seconds || 'N/A'}s</strong></p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {job.status === "failed" && (
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--accent-danger)',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{
                      color: 'var(--accent-danger)',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <X style={{ width: '1.25rem', height: '1.25rem' }} />
                      Processing Failed
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--accent-danger)' }}>
                      {job.error}
                    </p>
                  </div>
                )}

                {/* Reset Button */}
                {(job.status === "completed" || job.status === "failed" || job.status === "partially_completed") && (
                  <button
                    onClick={handleReset}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-card-hover)';
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-dark)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    Upload More Documents
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
