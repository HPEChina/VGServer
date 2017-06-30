(defproject md "0.0.1"
  :dependencies [[org.clojure/clojure "1.8.0"]
	               [org.clojure/clojurescript "1.9.89"]
	               [cljsjs/react "15.2.1-0"]]
  :plugins [[lein-cljsbuild "1.1.3"]]
  :cljsbuild{:builds [{
    :compiler {:main "org.huawei.md"
              :target :nodejs}, 
    :id "main", 
    :source-paths ["src/clojure/script"]}]})
