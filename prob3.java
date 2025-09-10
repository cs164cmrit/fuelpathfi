import java.util.*;
import java.io.*;

public class prob3 {
    
    static class Edge {
        int to, distance;
        
        Edge(int to, int distance) {
            this.to = to;
            this.distance = distance;
        }
    }
    
    static class State implements Comparable<State> {
        int distance, city, fuel;
        
        State(int distance, int city, int fuel) {
            this.distance = distance;
            this.city = city;
            this.fuel = fuel;
        }
        
        @Override
        public int compareTo(State other) {
            return Integer.compare(this.distance, other.distance);
        }
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input
        int N = sc.nextInt();
        int M = sc.nextInt();
        int F = sc.nextInt();
        
        // Build adjacency list
        ArrayList<ArrayList<Edge>> adj = new ArrayList<>();
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
        int result = dijkstraWithFuel(N, F, adj, fuelStations);
        System.out.println(result);
    }
    
    static int dijkstraWithFuel(int N, int F, ArrayList<ArrayList<Edge>> adj, HashSet<Integer> fuelStations) {
        // Priority queue: State(distance, city, fuel)
        PriorityQueue<State> pq = new PriorityQueue<>();
        // Visited set: "city,fuel"
        HashSet<String> visited = new HashSet<>();
        
        pq.offer(new State(0, 1, F));
        
        while (!pq.isEmpty()) {
            State current = pq.poll();
            
            // Create state key
            String stateKey = current.city + "," + current.fuel;
            if (visited.contains(stateKey)) {
                continue;
            }
            visited.add(stateKey);
            
            // Check if reached destination
            if (current.city == N) {
                return current.distance;
            }
            
            // Explore neighbors
            for (Edge edge : adj.get(current.city)) {
                // Check if we have enough fuel to reach this neighbor
                if (edge.distance <= current.fuel) {
                    int newFuel = current.fuel - edge.distance;
                    
                    // If destination has fuel station, refuel
                    if (fuelStations.contains(edge.to)) {
                        newFuel = F;
                    }
                    
                    pq.offer(new State(current.distance + edge.distance, edge.to, newFuel));
                }
            }
        }
        
        return -1; // No path found
    }
}