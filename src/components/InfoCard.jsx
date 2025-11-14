

export default function InfoCard(props) {
  return (
    <>
    <div className="w-full lg:w-[50%] md:w-[70%] h-auto rounded-lg border-2 border-gray-200 p-6 flex justify-between">
        <div className="w-[30%] flex flex-col justify-center items-center">
            <div className="w-[120px] h-[120px] bg-amber-100 rounded-full border-2 border-gray-400 relative">
                {/* profile image */}
                
            </div>
            
        </div>
        <div className="w-[60%] flex flex-col justify-center">
            <h1 className="text-[1.3rem]">{props.name || 'Fullname name'}</h1>
            <p className="">{props.email || 'email'}</p>
            <p className="">{props.mobile || 'mobile number'}</p>
        </div>
    </div>
    </>
  )
}
