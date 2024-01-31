let mainYear = 10;

Promise.all([
    fetch("ne_110m_admin_0_countries.geojson").then((res) => res.json()),
    d3.csv("Quality1.csv"),
]).then(([countries, energyData]) => {
    console.log("Initial_countries:", energyData);

    const initialYearData = energyData.filter((d) => d.Rank == mainYear);
    console.log(initialYearData);

    // Get unique years from the data
    const uniqueYears = Array.from(new Set(energyData.map((d) => +d.Rank)));

    // Populate the dropdown with years
    const yearDropdown = d3.select("#yearDropdown");
    yearDropdown
        .selectAll("option")
        .data(uniqueYears)
        .enter()
        .append("option")
        .text((d) => d)
        .attr("value", (d) => d);
    yearDropdown.property("value", mainYear);

    // Add an event listener to the dropdown
    yearDropdown.on("change", function () {
        const selectedYear = +this.value;
        mainYear = selectedYear;
        updateGlobeVisualization(selectedYear);
    });

    function updateGlobeVisualization(selectedYear) {
        console.log("Called:", selectedYear);

        // Clear the previous legend content
        d3.select("#legend").html("");

        const filteredEnergyData = energyData.filter(
            (d) => d.Rank == selectedYear
        );

        console.log("Check:", filteredEnergyData);

        // Map to store energy data by country
        const energyDataMap = {};
        filteredEnergyData.forEach((d) => {
            energyDataMap[d.Country] = d;
        });

        // Prepare for GDP color scaling
        const gdpValues = filteredEnergyData
            .map((d) => +d.Stability)
            .filter(Boolean);
        
        // Define a logarithmic color scale (can switch to linear if preferred)
        const colorScale = d3
            .scaleSequential(d3.interpolateBlues)
            .domain([Math.log(gdpValues)]);

        countries.features.forEach((feat) => {
            const countryEnergyData =
                energyDataMap[feat.properties.ADMIN] || {};
            feat.properties.energyData = countryEnergyData;
        });

        // Create a legend
        const legend = d3
            .select("#legend")
            .append("svg")
            .attr("width", 700)
            .attr("height", 50)
            .append("g")
            .attr("transform", "translate(10,0)");

        // Add gradient to legend
        legend
            .append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .selectAll("stop")
            .data(colorScale.ticks(10).map((t, i, n) => ({ offset: `${(i * 100) / n.length}%`, color: colorScale(t) })))
            .enter()
            .append("stop")
            .attr("offset", (d) => d.offset)
            .attr("stop-color", (d) => d.color);

        // Add a rectangle to the legend
        legend
            .append("rect")
            .attr("width", 180)
            .attr("height", 10)
            .style("fill", "url(#gradient)")
            .style("font-size", "12px");

        // Add legend axis
        const legendScale = d3.scaleLinear().range([0, 70]).domain(gdpValues);
        const legendAxis = d3.axisBottom(legendScale).ticks(5).tickFormat(d3.format(".2s"));

        legend
            .append("g")
            .attr("transform", "translate(0,10)")
            .call(legendAxis);

        // Update the legend when the globe is updated
        function updateLegend() {
            // Update legend axis
            legend.select("g").call(legendAxis);
        }

        const upDatedworld = Globe()
            .globeImageUrl(
                "https://unpkg.com/three-globe/example/img/earth-night.jpg"
            )
            .backgroundImageUrl(
                "https://unpkg.com/three-globe/example/img/night-sky.png"
            )
            .lineHoverPrecision(0)
            .polygonsData(
                countries.features.filter((d) => d.properties.ISO_A2 !== "AQ")
            )
            .polygonAltitude(0.06)
            .polygonSideColor(() => "rgba(0, 100, 0, 0.15) ")/*rgba(0, 100, 0, 0.15) */
            .polygonStrokeColor(() => "rgb(81, 40, 244)")/*rgb(81, 40, 244)" */
            .polygonsTransitionDuration(300);

        // Set default x-axis scroll to 50% after a short delay
        setTimeout(() => {
            const globeVizElement = document.getElementById("globeViz");
            const defaultXScroll = (globeVizElement.scrollWidth - globeVizElement.clientWidth) / 2;
            globeVizElement.scrollLeft = defaultXScroll;
        }, 100);

        upDatedworld
        .polygonLabel(({ properties: d }) => {
            const qualityData = d.energyData || {};
           

            

            // Calculate percentages for each energy source
          //  const coalPercentage = ((parseFloat(energyData.Rights) || 0) / totalEnergyConsumption) * 100;
          //const StabilityPercentage = parseFloat(energyData.Stability)
            const  RightsPercentage = parseFloat(qualityData.Rights);
            const  StabilityPercentage = parseFloat(qualityData.Rights);
            const HealthPercentage = parseFloat(qualityData.Health) ;
            const SafetyPercentage = parseFloat(qualityData.Safety); 
            const ClimatePercentage = parseFloat(qualityData.Climate);
            const CostsPercentage = parseFloat(qualityData.Costs) ;
           // const renewablesPercentage =parseFloat(energyData.TotalQualityOfLife) 

            return `
<div class="tooltip">
  <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
  <br/>
  Stability: <i> ${StabilityPercentage.toFixed(2)}%</i><br/>
  Rights: <i> ${RightsPercentage.toFixed(2)}%</i><br/>
  Health: <i>${HealthPercentage.toFixed(2)}%</i><br/>
  Safety : <i>${SafetyPercentage.toFixed(2)}%</i><br/>
  Climate : <i>${ClimatePercentage.toFixed(2)}%</i><br/>
  Costs: <i>${CostsPercentage.toFixed(2)}%</i><br/>
  
</div>
`;
        })

            .onPolygonHover((hoverD) => {
                upDatedworld.polygonsData().forEach((d) => {
                    if (
                        hoverD &&
                        d === hoverD &&
                        hoverD.properties.energyData &&
                        hoverD.properties.energyData.Stability !== undefined
                    ) {
                        // When hovering over a country with defined GDP
                        d.properties.__highlighted = true;
                    } else {
                        // Reset other countries or countries with undefined GDP
                        d.properties.__highlighted = false;
                    }
                });

                upDatedworld
                    .polygonAltitude((d) =>
                        d.properties.__highlighted ? 0.6 : 0.06
                    )
                    .polygonCapColor((d) => {
                        if (d.properties.__highlighted) {
                            return "#FA8072 "; //FA8072 Color for highlighted country
                        }
                        const gdpValue = d.properties.energyData
                            ? d.properties.energyData.Stability
                            : 0;
                        return gdpValue > 0
                            ? colorScale(Math.log(gdpValue))
                            : "#cefad0";//cefad0
                    });

                upDatedworld.onPolygonClick((clickedCountry) => {
                    if (
                        clickedCountry &&
                        clickedCountry.properties &&
                        clickedCountry.properties.energyData
                    ) {
                        const countryName = encodeURIComponent(
                            clickedCountry.properties.ADMIN
                        );
                        const selectedYear = mainYear; // You may want to use the current selected year or obtain it from elsewhere

                        
                    }
                });
            });

        // Set default x-axis scroll to 50%
        const globeVizElement = document.getElementById("globeViz");
        const defaultXScroll = (globeVizElement.scrollWidth - globeVizElement.clientWidth) / 2;
        globeVizElement.scrollLeft = defaultXScroll;

        upDatedworld(document.getElementById("globeViz"));
        updateLegend();
    }

    updateGlobeVisualization(mainYear);
});

