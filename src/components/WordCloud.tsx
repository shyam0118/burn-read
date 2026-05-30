'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WordCloudProps {
  words: { word: string; count: number }[];
  label: string;
  width?: number;
  height?: number;
}

export default function WordCloud({
  words,
  label,
  width = 500,
  height = 300,
}: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || words.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const maxCount = words[0]?.count ?? 1;
    const minCount = words[words.length - 1]?.count ?? 1;
    const fontSize = d3
      .scaleLinear()
      .domain([minCount, maxCount])
      .range([12, 48])
      .clamp(true);

    const color = d3
      .scaleLinear<string>()
      .domain([minCount, maxCount])
      .range(['#38bdf844', '#38bdf8'])
      .clamp(true);

    const group = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const shuffled = [...words].sort(() => Math.random() - 0.5);

    const nodes = shuffled.map((w) => ({
      text: w.word,
      size: fontSize(w.count),
    }));

    // Simple spiral layout
    let angle = 0;
    let radius = 0;

    for (const node of nodes) {
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      group
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', node.size)
        .attr('fill', d3.interpolateCool(Math.random()) /* replaced with inline */)
        .style('fill', color(fontSize.invert(node.size)))
        .style('font-weight', '600')
        .style('opacity', 0.85)
        .text(node.text);

      angle += 1.2;
      radius += 5;
    }
  }, [words, width, height]);

  if (words.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-medium text-muted mb-3">{label}</h3>
        <p className="text-muted text-sm text-center py-8">Not enough words</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h3 className="text-sm font-medium text-muted mb-3">{label}</h3>
      <div className="flex justify-center overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-full h-auto"
          style={{ maxHeight: height }}
        />
      </div>
    </div>
  );
}
