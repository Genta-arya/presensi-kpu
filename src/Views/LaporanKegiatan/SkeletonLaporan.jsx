const SkeletonLaporan = () => {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5,6,7,8,9,10].map((i) => (
        <div
          key={i}
          className="bg-white p-3 rounded-lg shadow animate-pulse mt-10 pb-4"
        >
          <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-40 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLaporan;
