
import { FiMail, FiPhone, FiUser, FiEdit2 } from "react-icons/fi";

export default function InfoCard({ user }) {
  const profileImgSrc = user?.profileImg
    ? user.profileImg.startsWith("http")
      ? user.profileImg
      : `http://localhost:8080${user.profileImg}`
    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
      {/* Header Background */}
      <div className="h-32 bg-linear-to-r from-gray-900 to-gray-800 relative">
        <div className="absolute top-4 right-4">
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
            <FiEdit2 size={18} />
          </button>
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Profile Image - Overlapping the header */}
        <div className="relative -mt-16 mb-6 flex justify-center sm:justify-start">
          <div className="h-32 w-32 rounded-full ring-4 ring-white shadow-lg bg-white overflow-hidden">
            <img
              src={profileImgSrc}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.name || "User Name"}
            </h1>
            <p className="text-gray-500 font-medium mt-1">Passenger</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4 hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FiMail size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Email Address
                </p>
                <p className="text-gray-900 font-medium truncate" title={user?.email}>
                  {user?.email || "No email provided"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4 hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <FiPhone size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Phone Number
                </p>
                <p className="text-gray-900 font-medium">
                  {user?.mobile || "No mobile provided"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4 hover:bg-gray-100 transition-colors md:col-span-2">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <FiUser size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Account Status
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <p className="text-gray-900 font-medium">Active Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
