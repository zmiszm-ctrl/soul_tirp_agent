/**
 * 高德地图服务封装
 * 提供逆地理编码、驾车路线规划、地理编码等功能
 */

declare const AMap: any;

/**
 * 给 Promise 添加超时控制
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label}超时(${ms}ms)`));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export interface GeocodeResult {
  address: string;
  city: string;
  district: string;
  province: string;
}

export interface DrivingResult {
  distance: string; // 如 "287km"
  duration: string; // 如 "3小时12分钟"
  distanceMeters: number;
  durationSeconds: number;
}

/**
 * 逆地理编码 - 经纬度转中文地址
 */
export function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  return withTimeout(
    new Promise<GeocodeResult>((resolve, reject) => {
      try {
        if (typeof AMap === 'undefined' || !AMap.Geocoder) {
          reject(new Error('AMap SDK未加载'));
          return;
        }
        const geocoder = new AMap.Geocoder();
        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            const addrComp = result.regeocode.addressComponent;
            resolve({
              address: result.regeocode.formattedAddress,
              city: addrComp.city || addrComp.province,
              district: addrComp.district,
              province: addrComp.province,
            });
          } else {
            reject(new Error(`逆地理编码失败: ${status}`));
          }
        });
      } catch (e) {
        reject(e);
      }
    }),
    5000,
    '逆地理编码'
  );
}

/**
 * 驾车路线规划 - 获取距离和时间
 */
export function getDrivingRoute(
  fromLngLat: [number, number], // [lng, lat]
  toLngLat: [number, number]
): Promise<DrivingResult> {
  return withTimeout(
    new Promise<DrivingResult>((resolve, reject) => {
      try {
        if (typeof AMap === 'undefined' || !AMap.Driving) {
          reject(new Error('AMap SDK未加载'));
          return;
        }
        const driving = new AMap.Driving({
          policy: AMap.DrivingPolicy?.LEAST_TIME || 'LEAST_TIME',
        });

        driving.search(
          new AMap.LngLat(fromLngLat[0], fromLngLat[1]),
          new AMap.LngLat(toLngLat[0], toLngLat[1]),
          (status: string, result: any) => {
            if (status === 'complete' && result.routes?.length > 0) {
              const route = result.routes[0];
              const distKm = Math.round(route.distance / 1000);
              const durMin = route.time; // 秒
              const hours = Math.floor(durMin / 3600);
              const minutes = Math.round((durMin % 3600) / 60);

              resolve({
                distance: `${distKm}km`,
                duration: hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`,
                distanceMeters: route.distance,
                durationSeconds: route.time,
              });
            } else {
              reject(new Error(`驾车路线规划失败: ${status}`));
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    }),
    8000,
    '驾车路线规划'
  );
}

/**
 * 地理编码 - 地址转经纬度
 */
export function geocodeAddress(address: string): Promise<[number, number]> {
  return withTimeout(
    new Promise<[number, number]>((resolve, reject) => {
      try {
        if (typeof AMap === 'undefined' || !AMap.Geocoder) {
          reject(new Error('AMap SDK未加载'));
          return;
        }
        const geocoder = new AMap.Geocoder();
        geocoder.getLocation(address, (status: string, result: any) => {
          if (status === 'complete' && result.geocodes?.length > 0) {
            const location = result.geocodes[0].location;
            resolve([location.lng, location.lat]);
          } else {
            reject(new Error(`地理编码失败: ${status}`));
          }
        });
      } catch (e) {
        reject(e);
      }
    }),
    5000,
    '地理编码'
  );
}

/**
 * IP定位 - 通过高德 CitySearch 获取当前IP所在城市（无需用户授权）
 */
export function getLocalCity(): Promise<GeocodeResult> {
  return withTimeout(
    new Promise<GeocodeResult>((resolve, reject) => {
      try {
        if (typeof AMap === 'undefined' || !AMap.CitySearch) {
          reject(new Error('AMap SDK未加载'));
          return;
        }
        const citySearch = new AMap.CitySearch();
        citySearch.getLocalCity((status: string, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            resolve({
              address: (result.province || '') + (result.city || ''),
              city: result.city || result.province || '',
              district: result.district || '',
              province: result.province || '',
            });
          } else {
            reject(new Error(`IP定位失败: ${status}`));
          }
        });
      } catch (e) {
        reject(e);
      }
    }),
    5000,
    'IP定位'
  );
}

/**
 * 获取浏览器定位
 */
export function getBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return withTimeout(
    new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('用户拒绝了定位请求'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('定位信息不可用'));
              break;
            case error.TIMEOUT:
              reject(new Error('定位请求超时'));
              break;
            default:
              reject(new Error('定位失败'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    }),
    10000,
    '浏览器定位'
  );
}
