*Proper documentation is coming soon*



Structure:

* download_data.ipynb
  * Downloads linked connections, saves them to local files
* cluster_stops.ipynb
  * Read linked connections data, create clusters/partitions from them
* create_index.ipynb
  * Create an index file over all generated partitions -- these are then hosted on a remote host
* fragment_connections.ipynb
  * Read partition definition from a remote host, store the partitioned linked connections data to a local redis store
* `server/`
  * Host the partitioned linked connections
* `planner.js/`
  * Copy from https://github.com/openplannerteam/planner.js with an added CLI interface
* `benchmark.py`
  * Run the various `*_queries.json` files through `planner.js`, save the results to `*_results.json`
* `simulate_cache.ipynb`
  * Rerun all the evaluated queries through a simulated cache, save the results to `cache_results.json`
* `data_viz.ipynb`
  * Analyze results, visualize them
* `cluster_stops_viz.ipynb`
  * Visual inspection of generated partitions