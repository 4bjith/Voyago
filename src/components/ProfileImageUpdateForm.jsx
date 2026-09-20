import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import UserStore from "../zustand/UserStore";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FiUploadCloud, FiTrash2, FiArrowLeft, FiCheck } from "react-icons/fi";

export default function ProfileImgUpdateForm() {
  const [image, setImage] = useState(null);
  const token = UserStore((state) => state.token);
  const navigate = useNavigate();
  const { user, setUser } = UserStore();

  const clearImage = () => setImage(null);

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
      setUser({ ...user, profileImg: updatedUser.profileImg });
      toast.success("Profile photo updated successfully!");
      navigate("/account");
    },
    onError: (error) => {
      console.error("Error updating profile image:", error);
      toast.error("Failed to upload image. Please try again.");
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleUpdate = () => {
    if (!image) {
      toast.error("Please select an image first.");
      return;
    }
    const formData = new FormData();
    formData.append("profileImg", image);
    updateProfileImgMutation.mutate(formData);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors font-sans">
      <div className="w-full fixed top-4 z-50 flex justify-center">
        <Navbar />
      </div>
      <div className="h-28"></div>

      <main className="grow max-w-lg w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-sm border border-neutral-200 dark:border-zinc-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white mb-6 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Account</span>
          </Link>

          <h1 className="text-2xl font-black font-display text-black dark:text-white mb-1">
            Update Profile Avatar
          </h1>
          <p className="text-xs text-neutral-500 mb-6">
            Upload a high quality photo to help drivers identify you easily at pickup points.
          </p>

          <div className="relative mb-6">
            {!image ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 dark:border-zinc-800 hover:border-black dark:hover:border-white rounded-3xl cursor-pointer bg-neutral-50 dark:bg-zinc-900/50 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center mb-3">
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <p className="mb-1 text-xs font-bold text-black dark:text-white">
                    Click to select photo or drag and drop
                  </p>
                  <p className="text-[10px] text-neutral-400">PNG, JPG, WEBP up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 dark:bg-zinc-900 rounded-3xl border border-neutral-200 dark:border-zinc-800">
                <div className="w-32 h-32 rounded-full ring-4 ring-black dark:ring-white overflow-hidden shadow-md mb-4">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <FiTrash2 />
                  <span>Choose a different photo</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleUpdate}
            disabled={!image || updateProfileImgMutation.isPending}
            className={`w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
              !image || updateProfileImgMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {updateProfileImgMutation.isPending ? (
              <span>Uploading Avatar...</span>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Save New Avatar</span>
              </>
            )}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
