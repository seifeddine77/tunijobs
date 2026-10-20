'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LocateFixed, RefreshCw, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface TunisiaMapProps {
  selectedGovCode?: string;
  onSelectGovernorate?: (code: string | null) => void;
  onSelectJob?: (jobId: string) => void;
  onNearMeLocation?: (lat: number, lng: number) => void;
  jobsGeoJson?: any;
  choroplethData?: Record<string, number>;
  focusedLocation?: { lat: number; lng: number } | null;
}

export function TunisiaMap({
  selectedGovCode,
  onSelectGovernorate,
  onSelectJob,
  onNearMeLocation,
  jobsGeoJson,
  choroplethData = {},
  focusedLocation,
}: TunisiaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showChoropleth, setShowChoropleth] = useState(true);

  // Initialisation de la carte MapLibre GL
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | TuniJobs',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [9.8, 34.5], // Centre géographique de la Tunisie
      zoom: 6.2,
      minZoom: 5.5,
      maxZoom: 17,
      maxBounds: [
        [6.5, 30.0], // Sud-Ouest
        [13.0, 38.5], // Nord-Est
      ],
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', async () => {
      // 1. Charger le GeoJSON des 24 gouvernorats
      try {
        const govResp = await fetch('/geo/tunisia-governorates.geojson');
        const govGeoJson = await govResp.json();

        map.addSource('governorates', {
          type: 'geojson',
          data: govGeoJson,
        });

        // Layer Choroplèthe (Remplissage couleur selon le nombre d'offres)
        map.addLayer({
          id: 'governorates-fill',
          type: 'fill',
          source: 'governorates',
          paint: {
            'fill-color': '#93c5fd',
            'fill-opacity': 0.35,
          },
        });

        // Layer Bordures des gouvernorats
        map.addLayer({
          id: 'governorates-borders',
          type: 'line',
          source: 'governorates',
          paint: {
            'line-color': '#1d4ed8',
            'line-width': 1.5,
            'line-opacity': 0.7,
          },
        });

        // Layer Highlight au survol
        map.addLayer({
          id: 'governorates-highlight',
          type: 'line',
          source: 'governorates',
          paint: {
            'line-color': '#e11d48',
            'line-width': 3,
            'line-opacity': 0,
          },
        });

        // Événements d'interaction sur les gouvernorats
        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'tunijobs-map-popup',
        });

        map.on('mousemove', 'governorates-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          map.getCanvas().style.cursor = 'pointer';

          const feature = e.features[0];
          const code = feature.properties.code;
          const nameFr = feature.properties.nameFr;
          const nameAr = feature.properties.nameAr;
          const count = choroplethData[code] || 0;

          popup
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2 text-slate-900 font-sans">
                <div class="font-bold text-sm text-blue-700">${nameFr} (${nameAr})</div>
                <div class="text-xs text-slate-600 mt-1">
                  💼 <b>${count}</b> offre${count > 1 ? 's' : ''} active${count > 1 ? 's' : ''}
                </div>
                <div class="text-[10px] text-blue-600 mt-1 font-semibold">Cliquez pour filtrer</div>
              </div>
            `)
            .addTo(map);
        });

        map.on('mouseleave', 'governorates-fill', () => {
          map.getCanvas().style.cursor = '';
          popup.remove();
        });

        map.on('click', 'governorates-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          const code = e.features[0].properties.code;
          if (onSelectGovernorate) {
            onSelectGovernorate(code);
          }
        });
      } catch (err) {
        console.error('Erreur chargement GeoJSON gouvernorats:', err);
      }

      // 2. Initialiser la source des offres d'emploi pour le clustering
      map.addSource('jobs-points', {
        type: 'geojson',
        data: jobsGeoJson || { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      });

      // Layer Clusters (Cercles groupés)
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'jobs-points',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#3b82f6', // Bleu si < 5
            5,
            '#f59e0b', // Ambre si 5 - 15
            15,
            '#e11d48', // Rouge si > 15
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            5,
            24,
            15,
            30,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Layer Nombre dans les clusters
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'jobs-points',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Semibold'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Layer Marqueurs individuels (Non clusterisés)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'jobs-points',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#1d4ed8',
          'circle-radius': 9,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Clic sur un cluster : zoomer dedans
      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource('jobs-points') as maplibregl.GeoJSONSource;

        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          map.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: (zoom ?? 10) + 0.5,
          });
        } catch (err) {
          console.error(err);
        }
      });

      // Clic sur un marqueur individuel
      map.on('click', 'unclustered-point', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feat = e.features[0];
        const props = feat.properties;
        const coords = (feat.geometry as any).coordinates.slice();

        new maplibregl.Popup({ className: 'tunijobs-job-popup' })
          .setLngLat(coords)
          .setHTML(`
            <div class="p-3 text-slate-900 font-sans min-w-[200px]">
              <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mb-1">
                ${props.contractType} · ${props.workMode}
              </span>
              <h4 class="font-bold text-sm leading-tight text-slate-900">${props.title}</h4>
              <p class="text-xs text-slate-600 mt-1 font-medium">🏢 ${props.companyName}</p>
              <p class="text-xs text-slate-500 mt-0.5">📍 ${props.delegation || props.governorateName}</p>
              ${props.salaryMin ? `<p class="text-xs font-bold text-emerald-700 mt-1.5">💰 ${props.salaryMin} - ${props.salaryMax} ${props.currency}</p>` : ''}
              <a href="/offres/${props.slug}" class="mt-2.5 block text-center py-1.5 px-3 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition">
                Consulter l'offre →
              </a>
            </div>
          `)
          .addTo(map);

        if (onSelectJob) {
          onSelectJob(props.id);
        }
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Mettre à jour les données GeoJSON des offres quand les filtres changent
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('jobs-points') as maplibregl.GeoJSONSource;
    if (source && jobsGeoJson) {
      source.setData(jobsGeoJson);
    }
  }, [jobsGeoJson, mapLoaded]);

  // Mettre à jour les couleurs du choroplèthe quand les counts changent
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (mapRef.current.getLayer('governorates-fill')) {
      // Construire une expression de couleur dynamique selon choroplethData
      const fillColorExpression: any = ['case'];

      Object.entries(choroplethData).forEach(([code, count]) => {
        let color = '#eff6ff'; // 0 offres
        if (count >= 1 && count <= 2) color = '#93c5fd';
        else if (count >= 3 && count <= 5) color = '#3b82f6';
        else if (count > 5) color = '#1d4ed8';

        fillColorExpression.push(['==', ['get', 'code'], code], color);
      });

      // Couleur par défaut si non spécifié
      fillColorExpression.push('#f1f5f9');

      mapRef.current.setPaintProperty('governorates-fill', 'fill-color', fillColorExpression);
      mapRef.current.setPaintProperty('governorates-fill', 'fill-opacity', showChoropleth ? 0.45 : 0.05);
    }
  }, [choroplethData, showChoropleth, mapLoaded]);

  // Centrage si sélection d'un gouvernorat ou focus d'offre
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (focusedLocation) {
      mapRef.current.flyTo({
        center: [focusedLocation.lng, focusedLocation.lat],
        zoom: 13,
        essential: true,
      });
    }
  }, [focusedLocation, mapLoaded]);

  // Géolocalisation "Près de moi"
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 11,
            essential: true,
          });

          // Ajouter un marqueur "Moi"
          new maplibregl.Marker({ color: '#e11d48' })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup().setText('📍 Votre position actuelle'))
            .addTo(mapRef.current);
        }

        if (onNearMeLocation) {
          onNearMeLocation(latitude, longitude);
        }
      },
      (err) => {
        console.warn('Erreur géolocalisation:', err);
        // Position de secours : Tunis centre
        if (onNearMeLocation) {
          onNearMeLocation(36.8065, 10.1815);
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // Réinitialiser la vue Tunisie
  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [9.8, 34.5],
      zoom: 6.2,
      essential: true,
    });
    if (onSelectGovernorate) {
      onSelectGovernorate(null);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Conteneur de la carte MapLibre */}
      <div ref={mapContainer} className="w-full h-full min-h-[480px]" />

      {/* Barre d'outils flottante */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleNearMe}
          className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-md hover:bg-slate-50 hover:text-blue-600 transition border border-slate-200"
          title="Afficher les offres autour de ma position"
        >
          <LocateFixed className="w-4 h-4 text-rose-500" />
          <span>Près de moi</span>
        </button>

        <button
          onClick={handleResetView}
          className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-md hover:bg-slate-50 transition border border-slate-200"
          title="Recentrer sur la Tunisie"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Vue Tunisie</span>
        </button>

        <button
          onClick={() => setShowChoropleth(!showChoropleth)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg shadow-md transition border ${
            showChoropleth
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white text-slate-700 border-slate-200'
          }`}
          title="Activer / désactiver la coloration des 24 gouvernorats"
        >
          <Layers className="w-4 h-4" />
          <span>Choroplèthe</span>
        </button>
      </div>

      {/* Légende du Choroplèthe en bas à droite */}
      {showChoropleth && (
        <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs text-slate-700 font-sans">
          <div className="font-bold text-[11px] mb-1.5 text-slate-900">Densité des offres</div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#f1f5f9] border border-slate-300"></span>
            <span className="text-[10px]">0</span>
            <span className="w-3.5 h-3.5 rounded bg-[#93c5fd]"></span>
            <span className="text-[10px]">1-2</span>
            <span className="w-3.5 h-3.5 rounded bg-[#3b82f6]"></span>
            <span className="text-[10px]">3-5</span>
            <span className="w-3.5 h-3.5 rounded bg-[#1d4ed8]"></span>
            <span className="text-[10px]">6+</span>
          </div>
        </div>
      )}
    </div>
  );
}
