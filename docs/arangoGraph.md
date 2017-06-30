map=graph_module._relation('map','model','model');
edgedefinitions = graph_module._edgeDefinitions(map)
edgedefinitions = graph_module._extendEdgeDefinitions(map)

graph_designer = graph_module._create("designer",edgedefinitions);
graph_designer.map.save('model/8','model/1026',{attribute:{id:1}})
graph_designer.map.save('model/1026','model/1024',{attribute:{id:1}})
graph_designer._getConnectingEdges({isCapital : true}, {isCapital : true});
graph_designer._addVertexCollection("modelClass");
