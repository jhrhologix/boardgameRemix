import markerSDK from '@marker.io/browser';

let markerWidget: any = null;

export async function initializeMarker() {
  try {
    if (!markerWidget) {
      markerWidget = await markerSDK.loadWidget({
        project: '68f68b51d482ea27a3d932ca',
      });
    }
    return markerWidget;
  } catch (error) {
    console.error('Failed to initialize Marker.io widget:', error);
    return null;
  }
}

export function showMarker() {
  if (markerWidget) {
    markerWidget.show();
  }
}

export function hideMarker() {
  if (markerWidget) {
    markerWidget.hide();
  }
}
