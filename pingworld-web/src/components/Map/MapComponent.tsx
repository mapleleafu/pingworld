import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { fromLonLat } from "ol/proj";
import type { FeatureLike } from "ol/Feature";
import "ol/ol.css";
import OLCesium from "olcs/OLCesium";
import { usePings } from "@/hooks/usePings";
import { useSocket } from "@/contexts/SocketContext";
import { Achievement } from "@/services/socket/types";
import socketService from "@/services/socket/socketService";
import { Rarity } from "../Achievements/constants";
import { PingData } from "@/services/socket/types";
import { Loader } from "@/components/UI/Loader";
import * as MapConstants from "./constants";
import { setGlobalPingCount } from "@/components/Layout/PingCounters";
import PingCounters from "@/components/Layout/PingCounters";
import MainLayout from "@/components/Layout/MainLayout";

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const olCesiumRef = useRef<OLCesium | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const activePingsRef = useRef<globalThis.Map<Feature, PingData>>(
    new globalThis.Map(),
  );
  const animationRef = useRef<number | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [is3DEnabled, setIs3DEnabled] = useState(
    MapConstants.INITIAL_3D_ENABLED,
  );
  const { activePings } = usePings();
  const { sendPing, isConnected, isPingDisabled } = useSocket();
  const [isFollowPings, setIsFollowPings] = useState(
    MapConstants.INITIAL_FOLLOW_PINGS,
  );
  const isFollowPingsRef = useRef(isFollowPings);
  const [isMapAnimating, setIsMapAnimating] = useState(false);
  const animationQueueRef = useRef<{ latitude: number; longitude: number }[]>(
    [],
  );
  const [isMapLoading, setIsMapLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
      style: (feature: FeatureLike) => {
        const pingData = activePingsRef.current.get(feature as Feature);
        if (!pingData) return undefined;

        const elapsed = Date.now() - pingData.timestamp;

        const easeOutQuad = (t: number) => t * (2 - t);
        const progress = easeOutQuad(elapsed / 5000);

        const pulse = Math.sin((elapsed * 4 * Math.PI) / 1000);
        const radius = 8 + 20 * progress + pulse * 3;
        const opacity = Math.max(0, 1 - progress);

        if (olCesiumRef.current?.getEnabled()) {
          const height = Math.sin(progress * Math.PI) * 50000;
          const geometry = (feature as Feature).getGeometry() as Point;
          const coords = geometry?.getCoordinates();
          if (coords) {
            coords[2] = height;
          }
        }

        return [
          new Style({
            image: new Circle({
              radius: radius * 1.5,
              stroke: new Stroke({
                color: `rgba(255, 0, 0, ${opacity * 0.5})`,
                width: 1,
              }),
            }),
          }),
          new Style({
            image: new Circle({
              radius: radius,
              fill: new Fill({ color: `rgba(255, 0, 0, ${opacity * 0.3})` }),
              stroke: new Stroke({
                color: `rgba(255, 0, 0, ${opacity})`,
                width: 2,
              }),
            }),
          }),
        ];
      },
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM({
            url: "https://{a-d}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat(MapConstants.INITIAL_LOCATION),
        zoom: MapConstants.INITIAL_ZOOM_LEVEL,
      }),

      controls: [], // Disable default controls
    });

    mapInstanceRef.current = map;

    setTimeout(() => {
      const ol3d = new OLCesium({ map });
      olCesiumRef.current = ol3d;

      if (is3DEnabled) {
        setIsMapLoading(true);
        ol3d
          .getCesiumScene()
          .globe.tileLoadProgressEvent.addEventListener(() => {
            if (ol3d.getCesiumScene().globe.tilesLoaded) {
              setIsMapLoading(false);
            }
          });
      }

      ol3d.setEnabled(is3DEnabled);
      ol3d.enableAutoRenderLoop();
    }, 100);

    const animate = () => {
      const currentTime = Date.now();
      const duration = MapConstants.PING_ANIMATION_DURATION;

      activePingsRef.current.forEach((pingData: PingData, feature: Feature) => {
        const elapsed = currentTime - pingData.timestamp;
        if (elapsed > duration) {
          vectorSource.removeFeature(feature);
          activePingsRef.current.delete(feature);
        }
      });

      if (activePingsRef.current.size > 0) {
        if (olCesiumRef.current?.getEnabled()) {
          activePingsRef.current.forEach((_: PingData, feature: Feature) => {
            feature.changed();
          });
        } else {
          vectorSource.changed();
        }
        map.render();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      map.setTarget(undefined);
      if (olCesiumRef.current) {
        olCesiumRef.current.setEnabled(MapConstants.INITIAL_3D_ENABLED);
      }
    };
  }, []);

  useEffect(() => {
    if (!vectorSourceRef.current) return;

    isFollowPingsRef.current = isFollowPings;
    const animateToLocation = (
      data: { latitude: number; longitude: number },
      force = false,
    ) => {
      if (!mapInstanceRef.current || (!isFollowPingsRef.current && !force))
        return;

      if (isMapAnimating) {
        animationQueueRef.current.push(data);
        return;
      }

      setIsMapAnimating(true);
      mapInstanceRef.current.getView().animate(
        {
          center: fromLonLat([data.longitude, data.latitude]),
          zoom: MapConstants.MAP_ANIMATING_ZOOM_LEVEL,
          duration: MapConstants.MAP_ANIMATING_DURATION,
        },
        () => {
          setIsMapAnimating(false);
          if (animationQueueRef.current.length > 0) {
            const next = animationQueueRef.current.shift();
            if (next) animateToLocation(next);
          }
        },
      );
    };

    const handleUserLocation = (data: {
      latitude: number;
      longitude: number;
    }) => {
      animateToLocation(data, true);
    };

    socketService.on("userLocation", handleUserLocation);
    socketService.on("globalPingCount", (data) => {
      setGlobalPingCount(data);
    });

    activePings.forEach((pingData, pingId) => {
      // Check if we already have this ping
      let exists = false;
      activePingsRef.current.forEach((_, feature) => {
        if (feature.getId() === pingId) exists = true;
      });

      if (!exists) {
        const feature = new Feature({
          geometry: new Point(
            fromLonLat([pingData.longitude, pingData.latitude]),
          ),
        });
        feature.setId(pingId);

        activePingsRef.current.set(feature, {
          timestamp: pingData.timestamp || Date.now(),
          latitude: pingData.latitude,
          longitude: pingData.longitude,
        });

        vectorSourceRef?.current?.addFeature(feature);

        if (isFollowPings) {
          animateToLocation({
            latitude: pingData.latitude,
            longitude: pingData.longitude,
          });
        }
      }
    });
    return () => {
      socketService.off("userLocation", handleUserLocation);
      socketService.off("globalPingCount", handleUserLocation);
    };
  }, [activePings, isFollowPings]);

  const toggle3D = () => {
    setIsMapLoading(true);
    const current = olCesiumRef.current?.getEnabled();
    olCesiumRef.current?.setEnabled(!current);
    setIs3DEnabled(!current);

    if (!current) {
      // Switching to 3D
      const scene = olCesiumRef.current?.getCesiumScene();

      // Give Cesium time to start loading tiles
      setTimeout(() => {
        const checkLoaded = () => {
          if (scene?.globe.tilesLoaded) {
            setIsMapLoading(false);
          } else {
            requestAnimationFrame(checkLoaded);
          }
        };
        checkLoaded();
      }, 100);
    } else {
      setIsMapLoading(false); // 2D loads instantly
    }
  };

  const onTestAchievement = (rarity: Rarity) => {
    const achievement: Achievement = {
      id: `test-${Date.now()}`,
      name: "Test Achievement",
      description: "This is a test achievement",
      userName: "Test User",
      type: "test",
      rarity,
      isPersonal: true,
      isOwnAchievement: true,
    };

    socketService.triggerLocal("newUserAchievements", [achievement]);
  };

  const onToggleFollowPings = () => {
    setIsFollowPings((prev) => {
      const newValue = !prev;
      if (!newValue) {
        animationQueueRef.current = [];
        mapInstanceRef.current?.getView().cancelAnimations();
      }
      return newValue;
    });
  };

  return (
    <div className="fixed inset-0">
      <MainLayout
        onToggle3D={toggle3D}
        onSendPing={sendPing}
        onTestAchievement={onTestAchievement}
        onToggleFollowPings={onToggleFollowPings}
        isFollowPings={isFollowPings}
        isConnected={isConnected}
        is3DEnabled={is3DEnabled}
        isPingDisabled={isPingDisabled}
      />
      <PingCounters />
      <div ref={mapRef} className="h-full w-full" />
      {isMapLoading && <Loader />}
    </div>
  );
}