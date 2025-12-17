import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface FibonacciVisualizerProps {
  remainingCounts: number[]; // Array of 10 items (index 0 unused)
}

// Fibonacci sequence helper
const getFib = (n: number): number => {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  let a = 1, b = 1;
  for (let i = 3; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
};

const FibonacciVisualizer: React.FC<FibonacciVisualizerProps> = ({ remainingCounts }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = Math.min(width, 400);
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Create a group centered
    const g = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // We have numbers 1-9.
    // We will visualize them as bars radiating outwards or as arcs.
    // Let's do a spiral radial bar chart.
    
    // Calculate Fibonacci values for the counts
    // Counts range from 0 to 9.
    // Fib(0)=0, Fib(1)=1, ... Fib(9)=34.
    
    const data = remainingCounts.slice(1).map((count, i) => ({
      digit: i + 1,
      count: count,
      fibValue: getFib(count)
    }));

    // Scales
    // Angle scale: Split circle into 9 parts
    const angleScale = d3.scaleBand()
      .range([0, 2 * Math.PI])
      .domain(data.map(d => d.digit.toString()))
      .padding(0.1);

    // Radius scale based on max potential fib value (Fib(9) = 34)
    // Inner radius allows space for the number label
    const innerRadius = 40;
    const maxRadius = Math.min(width, height) / 2 - 20;
    
    const radiusScale = d3.scaleLinear()
      .range([innerRadius, maxRadius])
      .domain([0, 34]); // Max domain is Fib(9)

    // Colors
    const colorScale = d3.scaleOrdinal<string>()
      .domain(["1", "2", "3", "4", "5", "6", "7", "8", "9"])
      .range([
        "#00f3ff", // Cyan
        "#ff00ff", // Magenta
        "#fcee0a", // Yellow
        "#bc13fe", // Purple
        "#00f3ff",
        "#ff00ff", 
        "#fcee0a",
        "#bc13fe", 
        "#ffffff"
      ]);

    // Draw Spiral/Arcs
    const arc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(d => radiusScale(d.fibValue))
      .startAngle(d => angleScale(d.digit.toString())!)
      .endAngle(d => angleScale(d.digit.toString())! + angleScale.bandwidth())
      .padAngle(0.05)
      .cornerRadius(4);

    // Enter transition
    g.selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("fill", d => colorScale(d.digit.toString()))
      .attr("stroke", "#0f0f1a")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0px 0px 4px rgba(255,255,255,0.3))")
      .attr("d", arc)
      .on("mouseover", function(event, d) {
        d3.select(this).style("opacity", 0.8);
      })
      .on("mouseout", function(event, d) {
        d3.select(this).style("opacity", 1);
      });

    // Add labels
    g.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .text(d => d.digit)
      .attr("transform", d => {
        // Position at the inner radius edge + slight offset
        const angle = angleScale(d.digit.toString())! + angleScale.bandwidth() / 2 - Math.PI / 2;
        const r = innerRadius - 20; 
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        return `translate(${x}, ${y})`;
      });
      
    // Add value labels at the end of bars if space permits (optional)
    g.selectAll("text.value")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#050510") // Dark text on bright bar
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(d => d.count > 0 ? d.count : "")
      .attr("transform", d => {
        const angle = angleScale(d.digit.toString())! + angleScale.bandwidth() / 2 - Math.PI / 2;
        // Position slightly inside the outer edge
        const r = radiusScale(d.fibValue) - 10;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        return `translate(${x}, ${y})`;
      });

    // Central "Fib" Label
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#00f3ff")
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .text("FIB.VIZ");

  }, [remainingCounts]);

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center bg-cyber-panel/30 rounded-xl border border-cyber-cyan/20 backdrop-blur-sm p-4">
      <svg ref={svgRef} className="overflow-visible"></svg>
    </div>
  );
};

export default FibonacciVisualizer;
