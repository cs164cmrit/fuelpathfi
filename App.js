import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";

const FuelPathfindingVisualization = () => {
  // Graph configuration
  const [config, setConfig] = useState({
    cities: 4,
    fuelCapacity: 100,
    roads: [
      { from: 1, to: 2, distance: 80 },
      { from: 2, to: 3, distance: 60 },
      { from: 3, to: 4, distance: 70 },
      { from: 1, to: 3, distance: 120 },
      { from: 2, to: 4, distance: 90 },
    ],
    fuelStations: [2, 3],
  });

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCity, setCurrentCity] = useState(1);
  const [fuel, setFuel] = useState(100);
  const [isRefueling, setIsRefueling] = useState(false);
  const [completedEdges, setCompletedEdges] = useState(new Set());
  const [showConfig, setShowConfig] = useState(false);

  // Algorithm results
  const [solution, setSolution] = useState(null);
  const [animationSteps, setAnimationSteps] = useState([]);

  // JavaScript implementation of the Java algorithm
  class State {
    constructor(distance, city, fuel, path) {
      this.distance = distance;
      this.city = city;
      this.fuel = fuel;
      this.path = [...path];
    }
  }

  const buildAdjacencyList = (cities, roads) => {
    const adj = Array(cities + 1)
      .fill(null)
      .map(() => []);
    roads.forEach((road) => {
      adj[road.from].push({ to: road.to, distance: road.distance });
      adj[road.to].push({ to: road.from, distance: road.distance });
    });
    return adj;
  };

  const dijkstraWithFuel = (cities, fuelCapacity, fuelStations, roads) => {
    const adj = buildAdjacencyList(cities, roads);
    const pq = [];
    const visited = new Set();
    const fuelStationSet = new Set([1, ...fuelStations]); // Start city + fuel stations

    // Priority queue implementation (min-heap)
    const push = (state) => {
      pq.push(state);
      pq.sort((a, b) => a.distance - b.distance);
    };

    const pop = () => pq.shift();

    push(new State(0, 1, fuelCapacity, [1]));

    while (pq.length > 0) {
      const current = pop();
      const stateKey = `${current.city},${current.fuel}`;

      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      if (current.city === cities) {
        return {
          distance: current.distance,
          path: current.path,
          success: true,
        };
      }

      adj[current.city].forEach((edge) => {
        if (edge.distance <= current.fuel) {
          let newFuel = current.fuel - edge.distance;

          if (fuelStationSet.has(edge.to)) {
            newFuel = fuelCapacity;
          }

          const newPath = [...current.path, edge.to];
          push(
            new State(
              current.distance + edge.distance,
              edge.to,
              newFuel,
              newPath
            )
          );
        }
      });
    }

    return { success: false, distance: -1, path: [] };
  };

  const generateAnimationSteps = (path, roads, fuelCapacity, fuelStations) => {
    if (!path || path.length === 0) return [];

    const adj = buildAdjacencyList(config.cities, roads);
    const fuelStationSet = new Set([1, ...fuelStations]);
    const steps = [];

    let currentFuel = fuelCapacity;
    steps.push({
      city: path[0],
      fuel: currentFuel,
      action: "start",
      message: `Start at city ${path[0]} with full fuel`,
      totalDistance: 0,
    });

    let totalDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      // Find edge distance
      const edge = adj[from].find((e) => e.to === to);
      const edgeDistance = edge ? edge.distance : 0;

      // Travel
      currentFuel -= edgeDistance;
      totalDistance += edgeDistance;

      steps.push({
        city: to,
        fuel: currentFuel,
        action: "travel",
        message: `Travel from city ${from} to city ${to} (${edgeDistance} fuel used)`,
        edge: `${from}-${to}`,
        distance: edgeDistance,
        totalDistance,
      });

      // Refuel if at fuel station
      if (fuelStationSet.has(to) && i < path.length - 2) {
        steps.push({
          city: to,
          fuel: fuelCapacity,
          action: "refuel",
          message: `Refuel at station ${to}`,
          totalDistance,
        });
        currentFuel = fuelCapacity;
      }
    }

    steps[steps.length - 1].action = "finish";
    steps[steps.length - 1].message = "Arrived at destination!";

    return steps;
  };

  const solveProblem = () => {
    console.log("Solving pathfinding problem...");
    const result = dijkstraWithFuel(
      config.cities,
      config.fuelCapacity,
      config.fuelStations,
      config.roads
    );

    console.log("Solution:", result);
    setSolution(result);

    if (result.success) {
      const steps = generateAnimationSteps(
        result.path,
        config.roads,
        config.fuelCapacity,
        config.fuelStations
      );
      setAnimationSteps(steps);
    } else {
      setAnimationSteps([]);
    }
  };

  // Solve automatically when config changes
  useEffect(() => {
    solveProblem();
  }, [config]);

  const startAnimation = () => {
    if (!solution || !solution.success) {
      alert("No solution found! Try adjusting the configuration.");
      return;
    }

    setIsAnimating(true);
    setCurrentStep(0);
    setCurrentCity(1);
    setFuel(config.fuelCapacity);
    setCompletedEdges(new Set());
    setIsRefueling(false);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(0);
    setCurrentCity(1);
    setFuel(config.fuelCapacity);
    setCompletedEdges(new Set());
    setIsRefueling(false);
  };

  useEffect(() => {
    if (isAnimating && currentStep < animationSteps.length) {
      const timer = setTimeout(() => {
        const step = animationSteps[currentStep];

        if (step.action === "refuel") {
          setIsRefueling(true);
          setTimeout(() => {
            setIsRefueling(false);
            setFuel(step.fuel);
            setCurrentStep((prev) => prev + 1);
          }, 1500);
        } else {
          setCurrentCity(step.city);
          setFuel(step.fuel);

          if (step.edge) {
            setCompletedEdges((prev) => new Set([...prev, step.edge]));
          }

          if (step.action === "finish") {
            setIsAnimating(false);
          } else {
            setCurrentStep((prev) => prev + 1);
          }
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAnimating, currentStep, animationSteps]);

  // Generate node positions dynamically
  const generateNodePositions = (numCities) => {
    const positions = [];
    const centerX = 375;
    const centerY = 175;
    const radius = 120;

    for (let i = 0; i < numCities; i++) {
      const angle = (2 * Math.PI * i) / numCities - Math.PI / 2;
      positions.push({
        id: i + 1,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        isStart: i + 1 === 1,
        isEnd: i + 1 === numCities,
        isFuelStation: config.fuelStations.includes(i + 1),
      });
    }

    return positions;
  };

  const nodes = generateNodePositions(config.cities);

  const getNodeColor = (node) => {
    if (node.id === currentCity && isRefueling) return "#FFD700";
    if (node.id === currentCity) return "#FF6B6B";
    if (node.isStart) return "#4ECDC4";
    if (node.isEnd) return "#FF6B6B";
    if (node.isFuelStation) return "#45B7D1";
    return "#95A5A6";
  };

  const isEdgeInPath = (from, to) => {
    const edgeKey1 = `${from}-${to}`;
    const edgeKey2 = `${to}-${from}`;
    return completedEdges.has(edgeKey1) || completedEdges.has(edgeKey2);
  };

  const updateConfig = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addRoad = () => {
    const from = parseInt(document.getElementById("roadFrom").value);
    const to = parseInt(document.getElementById("roadTo").value);
    const distance = parseInt(document.getElementById("roadDistance").value);

    if (
      from &&
      to &&
      distance &&
      from !== to &&
      from <= config.cities &&
      to <= config.cities
    ) {
      const roadExists = config.roads.some(
        (r) =>
          (r.from === from && r.to === to) || (r.from === to && r.to === from)
      );

      if (!roadExists) {
        setConfig((prev) => ({
          ...prev,
          roads: [...prev.roads, { from, to, distance }],
        }));
      }
    }
  };

  const removeRoad = (index) => {
    setConfig((prev) => ({
      ...prev,
      roads: prev.roads.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Dynamic Fuel-Constrained Pathfinding
      </h1>

      {/* Configuration Panel */}
      <div className="mb-6">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          <Settings size={16} />
          {showConfig ? "Hide" : "Show"} Configuration
        </button>

        {showConfig && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Cities:
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={config.cities}
                  onChange={(e) =>
                    updateConfig("cities", parseInt(e.target.value) || 2)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fuel Capacity:
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={config.fuelCapacity}
                  onChange={(e) =>
                    updateConfig(
                      "fuelCapacity",
                      parseInt(e.target.value) || 100
                    )
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Fuel Stations (comma-separated city numbers):
              </label>
              <input
                type="text"
                value={config.fuelStations.join(", ")}
                onChange={(e) => {
                  const stations = e.target.value
                    .split(",")
                    .map((s) => parseInt(s.trim()))
                    .filter((n) => !isNaN(n) && n > 1 && n <= config.cities);
                  updateConfig("fuelStations", stations);
                }}
                className="w-full p-2 border rounded"
                placeholder="e.g., 2, 3, 4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Roads:</label>
              <div className="flex gap-2 mb-2">
                <input
                  id="roadFrom"
                  type="number"
                  min="1"
                  max={config.cities}
                  placeholder="From"
                  className="p-2 border rounded w-20"
                />
                <input
                  id="roadTo"
                  type="number"
                  min="1"
                  max={config.cities}
                  placeholder="To"
                  className="p-2 border rounded w-20"
                />
                <input
                  id="roadDistance"
                  type="number"
                  min="1"
                  placeholder="Distance"
                  className="p-2 border rounded w-24"
                />
                <button
                  onClick={addRoad}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add Road
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto">
                {config.roads.map((road, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-white rounded mb-1"
                  >
                    <span>
                      City {road.from} ↔ City {road.to} (Distance:{" "}
                      {road.distance})
                    </span>
                    <button
                      onClick={() => removeRoad(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Problem Status */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Algorithm Result</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Cities:</strong> {config.cities}
            <br />
            <strong>Roads:</strong> {config.roads.length}
            <br />
            <strong>Fuel Capacity:</strong> {config.fuelCapacity}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            {solution
              ? solution.success
                ? "✅ Solution Found"
                : "❌ No Solution"
              : "⏳ Computing..."}
            <br />
            <strong>Distance:</strong>{" "}
            {solution?.success ? solution.distance : "N/A"}
            <br />
            <strong>Path:</strong>{" "}
            {solution?.success ? solution.path.join(" → ") : "N/A"}
          </div>
          <div>
            <strong>Fuel Stations:</strong>{" "}
            {[1, ...config.fuelStations].join(", ")}
            <br />
            <strong>Algorithm:</strong> Modified Dijkstra
            <br />
            <strong>From Java:</strong> ✅ Translated
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={startAnimation}
          disabled={isAnimating || !solution?.success}
          className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={20} />
          Start Animation
        </button>
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isAnimating ? <Pause size={20} /> : <Play size={20} />}
          {isAnimating ? "Pause" : "Resume"}
        </button>
        <button
          onClick={resetAnimation}
          className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          <RotateCcw size={20} />
          Reset
        </button>
      </div>

      {/* Status Display */}
      {solution?.success && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Current City:</strong> {currentCity}
              <div className="text-sm text-gray-600">
                {nodes.find((n) => n.id === currentCity)?.isStart &&
                  "Start City"}
                {nodes.find((n) => n.id === currentCity)?.isEnd &&
                  "Destination"}
                {nodes.find((n) => n.id === currentCity)?.isFuelStation &&
                  !nodes.find((n) => n.id === currentCity)?.isStart &&
                  "Fuel Station"}
              </div>
            </div>
            <div>
              <strong>Fuel Level:</strong> {fuel}/{config.fuelCapacity}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(fuel / config.fuelCapacity) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <strong>Status:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded text-sm ${
                  isRefueling
                    ? "bg-yellow-200 text-yellow-800"
                    : isAnimating
                    ? "bg-green-200 text-green-800"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {isRefueling
                  ? "Refueling..."
                  : isAnimating
                  ? "Traveling"
                  : "Ready"}
              </span>
            </div>
          </div>
          {currentStep < animationSteps.length &&
            animationSteps[currentStep] && (
              <div className="mt-2 text-sm text-gray-700">
                <strong>Action:</strong> {animationSteps[currentStep].message}
              </div>
            )}
        </div>
      )}

      {/* Graph Visualization */}
      <div className="bg-white border rounded-lg p-4">
        <svg width="750" height="350" viewBox="0 0 750 350" className="w-full">
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Edges */}
          {config.roads.map((road, index) => {
            const fromNode = nodes.find((n) => n.id === road.from);
            const toNode = nodes.find((n) => n.id === road.to);
            if (!fromNode || !toNode) return null;

            return (
              <g key={index}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={
                    isEdgeInPath(road.from, road.to) ? "#FF6B6B" : "#BDC3C7"
                  }
                  strokeWidth={isEdgeInPath(road.from, road.to) ? 4 : 2}
                  strokeDasharray={
                    isEdgeInPath(road.from, road.to) ? "0" : "5,5"
                  }
                  className="transition-all duration-500"
                />
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 10}
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-600"
                >
                  {road.distance}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={25}
                fill={getNodeColor(node)}
                stroke="#2C3E50"
                strokeWidth="3"
                className={`transition-all duration-500 ${
                  isRefueling && node.id === currentCity ? "animate-pulse" : ""
                }`}
              />

              {isRefueling && node.id === currentCity && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={30}
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="3"
                  opacity="0.7"
                  className="animate-ping"
                />
              )}

              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                className="text-lg font-bold fill-white"
              >
                {node.id}
              </text>

              <text
                x={node.x}
                y={node.y - 40}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {node.isStart && "🟢 Start"}
                {node.isEnd && "🔴 End"}
                {node.isFuelStation &&
                  !node.isStart &&
                  !node.isEnd &&
                  "🔵 Fuel"}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Legend & Algorithm Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-400 rounded-full"></div>
            <span>Start City</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded-full"></div>
            <span>Current/End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
            <span>Fuel Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Refueling</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <strong>Algorithm:</strong> This visualization uses a JavaScript
          translation of your Java Dijkstra's algorithm with fuel constraints.
          The algorithm maintains state as (city, fuel) and explores paths while
          considering refueling opportunities at fuel stations.
        </div>
      </div>
    </div>
  );
};

export default FuelPathfindingVisualization;
