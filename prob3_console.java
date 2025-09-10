import java.util.*;
import java.io.*;

public class prob3_console {
    
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
        Scanner sc = new Scanner(System.in);
        
        // Read input
        int N = sc.nextInt();
        int M = sc.nextInt();
        int F = sc.nextInt();
        
        // Build adjacency list
        adj = new ArrayList<>();
        for (int i = 0; i <= N; i++) {
            adj.add(new ArrayList<>());
        }
        
        for (int i = 0; i < M; i++) {
            int u = sc.nextInt();
            int v = sc.nextInt();
            int d = sc.nextInt();
            adj.get(u).add(new Edge(v, d));
            adj.get(v).add(new Edge(u, d));
        }
        
        // Read fuel stations
        int S = sc.nextInt();
        HashSet<Integer> fuelStations = new HashSet<>();
        fuelStations.add(1); // Start city always has fuel
        
        for (int i = 0; i < S; i++) {
            int station = sc.nextInt();
            fuelStations.add(station);
        }
        
        sc.close();
        
        // Solve using modified Dijkstra
        int result = dijkstraWithFuel(N, F, fuelStations);
        System.out.println(result);
        
        // Print the path steps if solution exists
        // if (result != -1) {
        //     printPathSteps(fuelStations, F);
        // }
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