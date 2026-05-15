export default function VotingMapPage() {
  return (
    <div className="w-full" style={{ height: 'calc(100vh - 120px)' }}>
      <iframe
        src="/map.html"
        className="w-full h-full border-0"
        title="California Voting Map"
      />
    </div>
  );
}
