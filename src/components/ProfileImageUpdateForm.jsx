import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";

export default function ProfileImgUpdateForm() {
  const [image, setImage] = useState(null); // stores the selected file
  const token = UserStore((state) => state.token);
  const navigate = useNavigate();
  const { user, setUser } = UserStore();

  const clearImage = () => setImage(null);

  // React Query mutation to update profile image
  const updateProfileImgMutation = useMutation({
    mutationFn: async (formData) => {
      return await api.put("/userupdate", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (response) => {
      const updatedUser = response.data.user;
      // Update Zustand store
      setUser({ ...user, profileImg: updatedUser.profileImg });
      toast.success("Profile image updated successfully!");
      navigate("/account");
    },
    onError: (error) => {
      console.error("Error updating profile image:", error);
      toast.error("Failed to update profile image.");
    },
  });

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  // Trigger update mutation
  const handleUpdate = () => {
    if (!image) {
      alert("Please select an image before updating.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImg", image);

    updateProfileImgMutation.mutate(formData);
    setTimeout(() => navigate("/account"), 1000);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow font-sans">
      <h2 className="text-2xl font-bold mb-2">Profile Image</h2>
      <p className="text-gray-600 mb-6">Update your profile picture here.</p>

      {/* File Input */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-black rounded-lg px-3 py-2 focus:outline-none"
        />
      </div>

      {/* Image Preview */}
      {image && (
        <div className="mb-4">
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-full border mx-auto"
          />
          <button
            onClick={clearImage}
            className="mt-2 block mx-auto text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}

      {/* Update Button */}
      <button
        onClick={handleUpdate}
        disabled={updateProfileImgMutation.isPending}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          updateProfileImgMutation.isPending
            ? "bg-gray-500 text-white"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {updateProfileImgMutation.isPending ? "Updating..." : "Update"}
      </button>
      {/* <ToastContainer/> */}
    </div>
  );
}
