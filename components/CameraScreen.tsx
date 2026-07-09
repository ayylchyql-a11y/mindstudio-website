export default function CameraScreen() {
  return (
    <div className="screen scr-camera">
      <div className="cam-main" aria-hidden="true" />
      <div className="cam-sun" aria-hidden="true" />
      <div className="cam-hud">
        <span className="cam-pill">4K · 60</span>
        <span className="cam-pill">DUAL</span>
      </div>
      <div className="cam-pip" aria-hidden="true" />
      <div className="cam-shutter" aria-hidden="true" />
    </div>
  );
}
