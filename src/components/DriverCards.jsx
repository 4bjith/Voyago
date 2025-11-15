export default function DriverCards(props) {
  return (
    <div className="w-full flex items-center gap-4 bg-white shadow-lg rounded-2xl p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 mb-6 transform hover:-translate-y-1">
      {/* Profile Image */}
      <div className="w-24 h-24 shrink-0">
        <div className="w-full h-full rounded-full border-4 border-gray-200 overflow-hidden shadow-md">
          {props.profile ? (
            <img
              src={props.profile}
              alt="Driver"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?semt=ais_hybrid&w=740&q=80"
              className="w-full h-full object-cover p-1"
              alt="Default"
            />
          )}
        </div>
      </div>

      {/* Driver Details */}
      <div className="flex flex-col items-start grow">
        <h1 className="text-xl font-bold text-gray-900">{props.name}</h1>
        <div className="flex items-center my-1">
          <span className="text-yellow-500 flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </span>
          <span className="text-gray-600 text-sm ml-2">(5.0)</span>
        </div>
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">Mobile:</span> {props.mobile}
        </p>
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">Vehicle:</span> {props.vehicle}
        </p>
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">License:</span> {props.licence}
        </p>
      </div>

      {/* Booking Button */}
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={() => {
            props.setDriverInfo({
              name: props.name,
              id: props._id,
            });
            props.setOpen("rideForm");
          }}
          className="px-6 py-2 bg-black text-white font-semibold rounded-full cursor-pointer shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
