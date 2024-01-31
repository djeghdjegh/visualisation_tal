document.addEventListener("DOMContentLoaded", function() {
    // Utilisez Fetch pour charger le fichier CSV
    fetch('Quality.csv')
        .then(response => response.text())
        .then(data => {
            // Transformez le texte en tableau d'objets
            var dataset = d3.csvParse(data);

            // Sélectionnez la colonne à visualiser
            var columnToPlot = 'TotalQuality of life(100%)';

            // Créez un histogramme avec D3.js
            var width = 800;
            var height = 400;
            var margin = { top: 20, right: 30, bottom: 30, left: 40 };

            var svg = d3.select("#histogram-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            var xScale = d3.scaleBand()
                .domain(dataset.map(d => d.Country))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, d => +d[columnToPlot])])
                .range([height - margin.bottom, margin.top]);

            // Ajoutez les barres à l'histogramme
            var bars = svg.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.Country))
                .attr("y", d => yScale(+d[columnToPlot]))
                .attr("width", xScale.bandwidth())
                .attr("height", d => height - margin.bottom - yScale(+d[columnToPlot]))
                .attr("fill", "steelblue")
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .attr("fill", "orange");
                    // Ajoutez une info-bulle avec le score de qualité de vie
                    svg.append("text")
                        .attr("id", "quality-label")
                        .attr("x", xScale(d.Country) + xScale.bandwidth() / 2)
                        .attr("y", yScale(+d[columnToPlot]) - 5)
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .text(d[columnToPlot]);
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("fill", "steelblue");
                    // Supprimer l'info-bulle
                    svg.select("#quality-label").remove();
                });

            // Ajoutez des axes
            svg.append("g")
                .attr("transform", `translate(0, ${height - margin.bottom})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .attr("text-anchor", "end");

            svg.append("g")
                .attr("transform", `translate(${margin.left}, 0)`)
                .call(d3.axisLeft(yScale));

        })
        .catch(error => console.error('Une erreur s\'est produite lors du chargement du fichier CSV:', error));
});
