import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const uploadImage = createAsyncThunk(
  'upload/uploadImage',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        url: response.data.url,
        publicId: response.data.public_id,
        message: response.data.message
      };
    } catch (error) {
      if (error.response) {
        return rejectWithValue({
          message: error.response.data.message || 'Image upload failed',
          status: error.response.status
        });
      }
      return rejectWithValue({
        message: error.message,
        status: 500
      });
    }
  }
);

const initialState = {
  imageUrl: null,
  publicId: null,
  loading: false,
  error: null,
  success: false,
  progress: 0 // Add progress tracking
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    resetUpload: (state) => {
      return {...initialState};
    },
    setUploadProgress: (state, action) => {
      state.progress = action.payload;
    },
    setImageUrl: (state, action) => {
      state.imageUrl = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.progress = 0;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.loading = false;
        state.imageUrl = action.payload.url;
        state.publicId = action.payload.publicId;
        state.success = true;
        state.progress = 100;
        state.error = null;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        state.progress = 0;
      });
  }
});

export const { resetUpload, setUploadProgress, setImageUrl } = uploadSlice.actions;
export default uploadSlice.reducer;