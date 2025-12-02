/**
 * Device Information Parser
 * Extracts device, browser, and OS information from user agent string
 */

export interface DeviceInfo {
  deviceType: string; // 'Desktop', 'Mobile', 'Tablet', 'Unknown'
  deviceName?: string; // e.g., 'iPhone 13', 'Samsung Galaxy S21'
  browser: string; // e.g., 'Chrome', 'Firefox', 'Safari', 'Edge'
  browserVersion?: string;
  os: string; // e.g., 'Windows', 'macOS', 'iOS', 'Android', 'Linux'
  osVersion?: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Parse user agent string to extract device information
 */
export function parseDeviceInfo(userAgent: string | null | undefined): DeviceInfo {
  if (!userAgent) {
    return {
      deviceType: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown',
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    };
  }

  const ua = userAgent.toLowerCase();
  
  // Detect device type
  const isMobile = /mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua);
  const isTablet = /tablet|ipad|playbook|silk|(android(?!.*mobile))/i.test(ua);
  const isDesktop = !isMobile && !isTablet;
  
  let deviceType = 'Unknown';
  if (isMobile) deviceType = 'Mobile';
  else if (isTablet) deviceType = 'Tablet';
  else if (isDesktop) deviceType = 'Desktop';

  // Detect OS
  let os = 'Unknown';
  let osVersion: string | undefined;
  
  if (ua.includes('windows')) {
    os = 'Windows';
    const winVersion = ua.match(/windows nt (\d+\.\d+)/);
    if (winVersion) {
      const version = parseFloat(winVersion[1]);
      if (version === 10.0) osVersion = '10/11';
      else if (version === 6.3) osVersion = '8.1';
      else if (version === 6.2) osVersion = '8';
      else if (version === 6.1) osVersion = '7';
      else osVersion = winVersion[1];
    }
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    os = 'macOS';
    const macVersion = ua.match(/mac os x (\d+[._]\d+)/);
    if (macVersion) {
      osVersion = macVersion[1].replace(/_/g, '.');
    }
  } else if (ua.includes('iphone')) {
    os = 'iOS';
    const iosVersion = ua.match(/os (\d+[._]\d+)/);
    if (iosVersion) {
      osVersion = iosVersion[1].replace(/_/g, '.');
    }
  } else if (ua.includes('android')) {
    os = 'Android';
    const androidVersion = ua.match(/android (\d+\.\d+)/);
    if (androidVersion) {
      osVersion = androidVersion[1];
    }
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('ipad')) {
    os = 'iPadOS';
    const ipadVersion = ua.match(/os (\d+[._]\d+)/);
    if (ipadVersion) {
      osVersion = ipadVersion[1].replace(/_/g, '.');
    }
  }

  // Detect browser
  let browser = 'Unknown';
  let browserVersion: string | undefined;
  
  if (ua.includes('edg/')) {
    browser = 'Edge';
    const edgeVersion = ua.match(/edg\/(\d+\.\d+)/);
    if (edgeVersion) browserVersion = edgeVersion[1];
  } else if (ua.includes('chrome/') && !ua.includes('edg/')) {
    browser = 'Chrome';
    const chromeVersion = ua.match(/chrome\/(\d+\.\d+)/);
    if (chromeVersion) browserVersion = chromeVersion[1];
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
    const firefoxVersion = ua.match(/firefox\/(\d+\.\d+)/);
    if (firefoxVersion) browserVersion = firefoxVersion[1];
  } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
    browser = 'Safari';
    const safariVersion = ua.match(/version\/(\d+\.\d+)/);
    if (safariVersion) browserVersion = safariVersion[1];
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera';
    const operaVersion = ua.match(/(?:opera|opr)\/(\d+\.\d+)/);
    if (operaVersion) browserVersion = operaVersion[1];
  } else if (ua.includes('msie') || ua.includes('trident/')) {
    browser = 'Internet Explorer';
    const ieVersion = ua.match(/(?:msie |rv:)(\d+\.\d+)/);
    if (ieVersion) browserVersion = ieVersion[1];
  }

  // Detect device name (for mobile devices)
  let deviceName: string | undefined;
  
  if (ua.includes('iphone')) {
    const iphoneModel = ua.match(/iphone\s*(\d+)/);
    if (iphoneModel) {
      deviceName = `iPhone ${iphoneModel[1]}`;
    } else {
      deviceName = 'iPhone';
    }
  } else if (ua.includes('ipad')) {
    deviceName = 'iPad';
  } else if (ua.includes('android')) {
    // Try to detect Android device model
    const androidModel = ua.match(/android.*?;\s*([^)]+)\)/);
    if (androidModel) {
      deviceName = androidModel[1].trim();
    } else {
      deviceName = 'Android Device';
    }
  }

  return {
    deviceType,
    deviceName,
    browser,
    browserVersion,
    os,
    osVersion,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Format device info as a readable string
 */
export function formatDeviceInfo(deviceInfo: DeviceInfo): string {
  const parts: string[] = [];
  
  if (deviceInfo.deviceName) {
    parts.push(deviceInfo.deviceName);
  } else {
    parts.push(deviceInfo.deviceType);
  }
  
  if (deviceInfo.os && deviceInfo.os !== 'Unknown') {
    parts.push(deviceInfo.os);
    if (deviceInfo.osVersion) {
      parts.push(deviceInfo.osVersion);
    }
  }
  
  if (deviceInfo.browser && deviceInfo.browser !== 'Unknown') {
    parts.push(deviceInfo.browser);
    if (deviceInfo.browserVersion) {
      parts.push(deviceInfo.browserVersion);
    }
  }
  
  return parts.join(' • ') || 'Unknown Device';
}

