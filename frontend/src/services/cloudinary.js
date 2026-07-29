import api from './api';

export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided for upload');

  let signatureData = null;
  
  try {
    // Try to fetch secure signature from backend
    const response = await api.get('/upload/signature');
    signatureData = response.data;
  } catch (err) {
    console.warn('Failed to get upload signature, falling back to unsigned upload', err);
  }

  const formData = new FormData();
  formData.append('file', file);

  // If we got the signature, use authenticated upload
  if (signatureData && signatureData.signature) {
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    if (signatureData.uploadPreset) {
      formData.append('upload_preset', signatureData.uploadPreset);
    }
    
    const cloudName = signatureData.cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error('Network error: Could not reach Cloudinary. Please check your internet connection or try turning off ad-blockers.');
      }
      throw err;
    }
  }

  // Fallback to unsigned upload if signature failed (e.g. offline queue mode or backend error)
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (err) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Network error: Could not reach Cloudinary. Please check your internet connection or try turning off ad-blockers.');
    }
    throw err;
  }
};
