document.addEventListener("DOMContentLoaded", function () {
    // Utilisez Fetch pour charger le fichier CSV
    fetch('Quality.csv')
        .then(response => response.text())
        .then(data => {
            // Transformez le texte en tableau d'objets
            var dataset = d3.csvParse(data);

            // Sélectionnez la colonne à visualiser
            var columnToPlot = 'Health(15%)';

            // Créez le diagramme Donut Chart avec D3.js
            var width = 350;
            var height = 350;
            var radius = Math.min(width, height) / 2;

            var svg = d3.select("#donut-container") // Utilisez l'ID du conteneur du donut chart
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var color = d3.scaleOrdinal(d3.schemeCategory10);

            var pie = d3.pie().value(d => d[columnToPlot]);

            var data_ready = pie(dataset);

            svg.selectAll('whatever')
                .data(data_ready)
                .enter()
                .append('path')
                .attr('d', d3.arc()
                    .innerRadius(radius * 0.5)
                    .outerRadius(radius)
                )
                .attr('fill', (d, i) => color(i))
                .attr("stroke", "white")
                .style("stroke-width", "2px");

            // Ajoutez une légende
            svg.selectAll('mySlices')
                .data(data_ready)
                .enter()
                .append('text')
                .text(d => d.data.Country)
                .attr('transform', d => 'translate(' + d3.arc().innerRadius(radius * 0.5).outerRadius(radius).centroid(d) + ')')
                .style('text-anchor', 'middle')
                .style('font-size', 10);

        })
        .catch(error => console.error('Une erreur s\'est produite lors du chargement du fichier CSV:', error));
});