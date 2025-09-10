    import java.util.*;
    import java.io.*;

    public class prob3_console_predinput {
        
        static class Edge {
            int to, distance;
            
            Edge(int to, int distance) {
                this.to = to;
                this.distance = distance;
            }
        }
        
        static class State implements Comparable<State> {
            int distance, city, fuel;
            ArrayList<Integer> path;
            
            State(int distance, int city, int fuel, ArrayList<Integer> path) {
                this.distance = distance;
                this.city = city;
                this.fuel = fuel;
                this.path = new ArrayList<>(path);
            }
            
            @Override
            public int compareTo(State other) {
                return Integer.compare(this.distance, other.distance);
            }
        }
        
        static ArrayList<Integer> shortestPath = new ArrayList<>();
        static ArrayList<ArrayList<Edge>> adj;
        
        public static void main(String[] args) {
            System.out.println("Program started");
            
            // Predetermined input values
            int N = 4;  // 4 cities
            int M = 5;  // 5 roads
            int F = 100; // fuel capacity = 100
            
            // Roads: from, to, distance
            int[][] roads = {
                {1, 2, 80},
                {2, 3, 60},
                {3, 4, 70},
                {1, 3, 120},
                {2, 4, 90}
            };
            
            // Fuel stations
            int[] stations = {2, 3};
            
            System.out.println("Cities: " + N + ", Roads: " + M + ", Fuel capacity: " + F);
            
            // Build adjacency list
            adj = new ArrayList<>();
            for (int i = 0; i <= N; i++) {
                adj.add(new ArrayList<>());
            }
            
            System.out.println("Building graph...");
            for (int i = 0; i < M; i++) {
                int u = roads[i][0];
                int v = roads[i][1];
                int d = roads[i][2];
                System.out.println("Road " + (i+1) + ": " + u + " <-> " + v + " (distance: " + d + ")");
                adj.get(u).add(new Edge(v, d));
                adj.get(v).add(new Edge(u, d));
            }
            
            // Set up fuel stations
            HashSet<Integer> fuelStations = new HashSet<>();
            fuelStations.add(1); // Start city always has fuel
            
            System.out.print("Fuel stations: ");
            for (int station : stations) {
                fuelStations.add(station);
                System.out.print(station + " ");
            }
            System.out.println("(plus start city 1)");
            
            System.out.println("Starting pathfinding algorithm...");
            // Solve using modified Dijkstra
            int result = dijkstraWithFuel(N, F, fuelStations);
            
            System.out.println("\n=== RESULT ===");
            System.out.println("Minimum distance: " + result);
            
            // Print the path steps if solution exists
            if (result != -1) {
                printPathSteps(fuelStations, F);
            } else {
                System.out.println("No path found from city 1 to city " + N);
            }
            
            System.out.println("Program finished");
        }
        
        static int dijkstraWithFuel(int N, int F, HashSet<Integer> fuelStations) {
            PriorityQueue<State> pq = new PriorityQueue<>();
            HashSet<String> visited = new HashSet<>();
            
            ArrayList<Integer> initialPath = new ArrayList<>();
            initialPath.add(1);
            pq.offer(new State(0, 1, F, initialPath));
            
            while (!pq.isEmpty()) {
                State current = pq.poll();
                
                String stateKey = current.city + "," + current.fuel;
                if (visited.contains(stateKey)) {
                    continue;
                }
                visited.add(stateKey);
                
                if (current.city == N) {
                    shortestPath = new ArrayList<>(current.path);
                    return current.distance;
                }
                
                for (Edge edge : adj.get(current.city)) {
                    if (edge.distance <= current.fuel) {
                        int newFuel = current.fuel - edge.distance;
                        
                        if (fuelStations.contains(edge.to)) {
                            newFuel = F;
                        }
                        
                        ArrayList<Integer> newPath = new ArrayList<>(current.path);
                        newPath.add(edge.to);
                        
                        pq.offer(new State(current.distance + edge.distance, edge.to, newFuel, newPath));
                    }
                }
            }
            
            return -1;
        }
        
        static void printPathSteps(HashSet<Integer> fuelStations, int F) {
            System.out.println("\n=== PATH STEPS ===");
            System.out.println("Start at city " + shortestPath.get(0) + " with fuel: " + F);
            
            int currentFuel = F;
            int totalDistance = 0;
            
            for (int i = 0; i < shortestPath.size() - 1; i++) {
                int from = shortestPath.get(i);
                int to = shortestPath.get(i + 1);
                
                // Find the distance for this edge
                int edgeDistance = 0;
                for (Edge edge : adj.get(from)) {
                    if (edge.to == to) {
                        edgeDistance = edge.distance;
                        break;
                    }
                }
                
                // Travel to next city
                currentFuel -= edgeDistance;
                totalDistance += edgeDistance;
                
                System.out.println("Step " + (i + 1) + ": Travel from city " + from + 
                                " to city " + to + 
                                " (distance: " + edgeDistance + 
                                ", fuel remaining: " + currentFuel + ")");
                
                // Check if refueling at destination
                if (fuelStations.contains(to)) {
                    System.out.println("        Refuel at city " + to + 
                                    " (fuel: " + currentFuel + " -> " + F + ")");
                    currentFuel = F;
                }
            }
            
            System.out.println("\nTotal distance: " + totalDistance);
            System.out.println("==================");
        }
    }