"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Thermometer, Droplets, Flame, Wind, Camera, Wifi, Battery, MapPin, CameraOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return <div className="text-sm font-mono">{time}</div>;
}

export default function Component() {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [fireDetected, setFireDetected] = useState(false);
  const [coLevel, setCOLevel] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [signalStrength, setSignalStrength] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [cameraUrl, setCameraUrl] = useState("https://webcast.airdroid.com/");
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      getData();
    }, 500);

    const getData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000");
        const data = await response.json();
        console.log(data);

        setFireDetected(data.flame)
        setTemperature(data.temp)
        setHumidity(data.hum)
        setCOLevel(data.co)
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    }

    return () => clearInterval(interval);
  }, [])

  // Auto-connect to the camera feed on component mount
  useEffect(() => {
    if (cameraUrl) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [cameraUrl]);

  const getStatusColor = (
    value: number,
    thresholds: { warning: number; danger: number },
  ) => {
    if (value >= thresholds.danger) return "destructive";
    if (value >= thresholds.warning) return "secondary";
    return "default";
  };

  const getCOStatus = () => {
    if (coLevel > 50) return { color: "destructive", text: "DANGER" };
    if (coLevel > 30) return { color: "secondary", text: "WARNING" };
    return { color: "default", text: "SAFE" };
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Survive Drone System</h1>
                <p className="text-sm text-gray-600">
                  Emergency Monitoring & Detection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                />
                <span className="text-sm">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">{signalStrength}/4</span>
              </div>
              <div className="flex items-center gap-1">
                <Battery className="w-4 h-4" />
                <span className="text-sm">{batteryLevel.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Alerts */}
        {(fireDetected || coLevel > 30) && (
          <div className="mb-6 space-y-2">
            {fireDetected && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  <strong>FIRE DETECTED!</strong> Immediate evacuation required.
                  Emergency services have been notified.
                </AlertDescription>
              </Alert>
            )}
            {coLevel > 30 && (
              <Alert className="border-yellow-500 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400">
                  <strong>HIGH CO LEVELS DETECTED!</strong> Carbon monoxide
                  concentration is above safe limits.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Live Video Feed
                  <Badge
                    variant={isOnline ? "default" : "destructive"}
                    className="ml-auto"
                  >
                    {isOnline ? "LIVE" : "OFFLINE"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <iframe src={cameraUrl} className="w-full h-full" />
                </div>
                  {/*
                  {cameraUrl ? (
                    <>
                      {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={`/api/stream?url=${encodeURIComponent(cameraUrl)}`}
                            alt="Drone camera feed"
                            className={`w-full h-full object-cover ${isStreamActive ? '' : 'opacity-0 h-0'}`}
                            onLoad={() => {
                              setIsStreamActive(true);
                              setStreamError('');
                            }}
                            onError={() => {
                              setIsStreamActive(false);
                              setStreamError('Failed to load camera feed. Make sure the drone is connected to the same network and the RTSP server is running.');
                            }}
                          />
                        </>
                      )}
                      {!isStreamActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center">
                          <CameraOff className="w-12 h-12 mb-2" />
                          <p className="font-medium">
                            {streamError || 'Camera feed not connected'}
                          </p>
                          <div className="mt-4 w-full max-w-md">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={cameraUrl}
                                onChange={(e) => setCameraUrl(e.target.value)}
                                placeholder="Enter camera stream URL (e.g., http://drone-ip:port/stream)"
                                className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button
                                onClick={() => {
                                  setIsStreamActive(false);
                                  setStreamError('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                Connect
                              </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-300">
                              Enter RTSP or MJPEG stream URL (e.g., rtsp://drone-ip:port/stream)
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center">
                      <CameraOff className="w-12 h-12 mb-2" />
                      <p className="font-medium">No camera feed configured</p>
                      <div className="mt-4 w-full max-w-md">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cameraUrl}
                            onChange={(e) => setCameraUrl(e.target.value)}
                            placeholder="Enter camera stream URL (e.g., http://drone-ip:port/stream)"
                            className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => {
                              setIsStreamActive(false);
                              setStreamError('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Connect
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-300">
                          Enter RTSP or MJPEG stream URL (e.g., rtsp://drone-ip:port/stream)
                        </p>
                      </div>
                    </div>
                  )}*/}
                  <div className="absolute top-4 left-4 bg-black/70 text-white backdrop-blur px-3 py-1 rounded">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Sector A-7, Grid 23.4°N, 45.6°W</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/70 text-white backdrop-blur px-3 py-1 rounded">
                    <Clock />
                  </div>
                  {fireDetected && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
                        🔥 FIRE DETECTED
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sensor Data */}
          <div className="space-y-6">
            {/* Fire Detection */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Fire Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${fireDetected ? "bg-red-500" : "bg-green-500"
                      }`}
                  >
                    <Flame className="w-8 h-8" />
                  </div>
                  <Badge
                    variant={fireDetected ? "destructive" : "default"}
                    className="text-lg px-4 py-1"
                  >
                    {fireDetected ? "FIRE DETECTED" : "NO FIRE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Carbon Monoxide */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind className="w-5 h-5" />
                  Carbon Monoxide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {coLevel.toFixed(1)} ppm
                  </div>
                  <Badge
                    variant={getCOStatus().color as any}
                    className="text-sm"
                  >
                    {getCOStatus().text}
                  </Badge>
                  <div className="mt-3 text-xs text-gray-600">
                    Safe: {"<"}30 ppm | Warning: 30-50 ppm | Danger: {">"}50 ppm
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Environmental Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Temperature */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {temperature.toFixed(1)}°C
                  </div>
                  <div className="text-sm text-gray-600">
                    {((temperature * 9) / 5 + 32).toFixed(1)}°F
                  </div>
                </div>
                <Badge
                  variant={getStatusColor(temperature, {
                    warning: 35,
                    danger: 45,
                  })}
                >
                  {temperature > 45
                    ? "CRITICAL"
                    : temperature > 35
                      ? "HIGH"
                      : "NORMAL"}
                </Badge>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${temperature > 45
                    ? "bg-red-500"
                    : temperature > 35
                      ? "bg-yellow-500"
                      : "bg-green-500"
                    }`}
                  style={{
                    width: `${Math.min(100, (temperature / 50) * 100)}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Humidity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {humidity.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Relative Humidity</div>
                </div>
                <Badge
                  variant={getStatusColor(humidity, {
                    warning: 70,
                    danger: 85,
                  })}
                >
                  {humidity > 85
                    ? "VERY HIGH"
                    : humidity > 70
                      ? "HIGH"
                      : "NORMAL"}
                </Badge>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${humidity > 85
                    ? "bg-red-500"
                    : humidity > 70
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                    }`}
                  style={{ width: `${humidity}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-white border-gray-200 shadow-sm mt-6">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Drone Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Sensors Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Video Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Battery: {batteryLevel.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}