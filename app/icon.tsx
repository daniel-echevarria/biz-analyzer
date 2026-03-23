import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#4f46e5',
          width: '100%',
          height: '100%',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
          <rect x="8" y="1" width="5" height="5" rx="1" fill="white" />
          <rect x="1" y="8" width="5" height="5" rx="1" fill="white" />
          <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
