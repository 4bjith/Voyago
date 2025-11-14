export default function DriverCards(props) {
  return (
    <div className="w-[90%] flex items-center gap-4 bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 mb-5">
      
      {/* Profile Image */}
      <div className="w-24 h-24 shrink-0">
        <div className="w-full h-full rounded-full border-2 border-gray-300 overflow-hidden">
          {props.profile ? (
            <img src={props.profile} alt="Driver" className="w-full h-full object-cover" />
          ) : (
            <img
              src="https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?semt=ais_hybrid&w=740&q=80"
              className="w-full h-full object-cover"
              alt="Default"
            />
          )}
        </div>
      </div>

      {/* Driver Details */}
      <div className="flex flex-col w-[60%]">
        <h1 className="text-lg font-semibold text-gray-800">Driver Name{props.name}</h1>
        <p className="text-gray-600 text-sm">Mobile No. {props.mobile}</p>
        <p className="text-gray-600 text-sm">Vehicle No.{props.vehicle}</p>
        <p className="text-gray-600 text-sm">Licence No.{props.licence}</p>
      </div>
    </div>
  );
}
