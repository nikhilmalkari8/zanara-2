import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkVisualization = ({ user, onLogout, setCurrentPage }) => {
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('network'); // 'network' or 'stats'
  const [filterLevel, setFilterLevel] = useState(2); // degrees of separation
  const svgRef = useRef();

  useEffect(() => {
    fetchNetworkData();
  }, [filterLevel]);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user's connections
      const connectionsResponse = await fetch('http://localhost:8001/api/connections/my-connections?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!connectionsResponse.ok) throw new Error('Failed to fetch connections');
      
      const connectionsData = await connectionsResponse.json();
      
      // Build network data
      const nodes = [];
      const links = [];
      const nodeMap = new Map();
      
      // Add current user as center node
      const centerNode = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        type: user.userType,
        level: 0,
        connections: connectionsData.connections.length,
        isCenter: true
      };
      nodes.push(centerNode);
      nodeMap.set(user.id, centerNode);
      
      // Add direct connections (level 1)
      connectionsData.connections.forEach((connection, index) => {
        const connectedUser = connection.user;
        const node = {
          id: connectedUser._id,
          name: `${connectedUser.firstName} ${connectedUser.lastName}`,
          type: connectedUser.userType,
          level: 1,
          relationship: connection.relationship,
          connectionStrength: connection.connectionStrength,
          mutualConnections: connection.mutualConnectionsCount || 0
        };
        
        nodes.push(node);
        nodeMap.set(connectedUser._id, node);
        
        // Add link to center
        links.push({
          source: user.id,
          target: connectedUser._id,
          strength: connection.connectionStrength,
          relationship: connection.relationship
        });
      });
      
      // If filterLevel > 1, fetch second-degree connections
      if (filterLevel >= 2 && connectionsData.connections.length > 0) {
        // For demo purposes, we'll simulate some second-degree connections
        // In production, you'd make additional API calls to get connections of connections
        await simulateSecondDegreeConnections(nodes, links, nodeMap);
      }
      
      setNetworkData({ nodes, links });
      
    } catch (error) {
      console.error('Error fetching network data:', error);
      // Fallback to mock data for demonstration
      setNetworkData(generateMockNetworkData());
    } finally {
      setLoading(false);
    }
  };

  const simulateSecondDegreeConnections = async (nodes, links, nodeMap) => {
    // Simulate some second-degree connections for demo
    const firstDegreeNodes = nodes.filter(n => n.level === 1);
    
    firstDegreeNodes.slice(0, 3).forEach((node, nodeIndex) => {
      // Add 2-3 second-degree connections for each first-degree node
      for (let i = 0; i < Math.min(3, 5 - nodeIndex); i++) {
        const secondDegreeId = `second_${nodeIndex}_${i}`;
        const secondDegreeNode = {
          id: secondDegreeId,
          name: `Connection ${nodeIndex + 1}.${i + 1}`,
          type: Math.random() > 0.5 ? 'model' : 'hiring',
          level: 2,
          relationship: 'colleague',
          connectionStrength: Math.floor(Math.random() * 50) + 25
        };
        
        nodes.push(secondDegreeNode);
        nodeMap.set(secondDegreeId, secondDegreeNode);
        
        // Link to first-degree node
        links.push({
          source: node.id,
          target: secondDegreeId,
          strength: secondDegreeNode.connectionStrength,
          relationship: 'colleague'
        });
      }
    });
  };

  const generateMockNetworkData = () => {
    const nodes = [
      {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        type: user.userType,
        level: 0,
        connections: 12,
        isCenter: true
      }
    ];
    
    const links = [];
    
    // Generate mock connections
    const relationships = ['colleague', 'client', 'photographer', 'agency-representative'];
    const userTypes = ['model', 'hiring'];
    
    for (let i = 1; i <= 12; i++) {
      const node = {
        id: `mock_${i}`,
        name: `Connection ${i}`,
        type: userTypes[Math.floor(Math.random() * userTypes.length)],
        level: 1,
        relationship: relationships[Math.floor(Math.random() * relationships.length)],
        connectionStrength: Math.floor(Math.random() * 80) + 20,
        mutualConnections: Math.floor(Math.random() * 5)
      };
      
      nodes.push(node);
      
      links.push({
        source: user.id,
        target: `mock_${i}`,
        strength: node.connectionStrength,
        relationship: node.relationship
      });
    }
    
    return { nodes, links };
  };

  useEffect(() => {
    if (!networkData.nodes.length || loading) return;
    
    renderNetwork();
  }, [networkData, selectedNode]);

  const renderNetwork = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    
    svg.attr('width', width).attr('height', height);
    
    const container = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create force simulation
    const simulation = d3.forceSimulation(networkData.nodes)
      .force('link', d3.forceLink(networkData.links)
        .id(d => d.id)
        .distance(d => 100 + (2 - d.source.level) * 50)
        .strength(d => d.strength / 100)
      )
      .force('charge', d3.forceManyBody()
        .strength(d => d.isCenter ? -1000 : -300)
      )
      .force('center', d3.forceCenter((width - margin.left - margin.right) / 2, (height - margin.top - margin.bottom) / 2))
      .force('collision', d3.forceCollide().radius(30));
    
    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(networkData.links)
      .enter().append('line')
      .attr('stroke', d => {
        const strengthColor = d3.scaleLinear()
          .domain([0, 100])
          .range(['#ccc', '#4ecdc4']);
        return strengthColor(d.strength);
      })
      .attr('stroke-width', d => Math.max(1, d.strength / 25))
      .attr('stroke-opacity', 0.7);
    
    // Create nodes
    const node = container.append('g')
      .selectAll('circle')
      .data(networkData.nodes)
      .enter().append('circle')
      .attr('r', d => {
        if (d.isCenter) return 25;
        if (d.level === 1) return 15;
        return 10;
      })
      .attr('fill', d => {
        if (d.isCenter) return '#667eea';
        if (d.type === 'model') return '#ff6b6b';
        return '#4ecdc4';
      })
      .attr('stroke', d => selectedNode?.id === d.id ? '#FFD700' : '#fff')
      .attr('stroke-width', d => selectedNode?.id === d.id ? 3 : 2)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('click', (event, d) => {
        setSelectedNode(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', d.isCenter ? 30 : d.level === 1 ? 18 : 12);
        
        // Show tooltip
        const tooltip = container.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${d.x + 20}, ${d.y - 10})`);
        
        const rect = tooltip.append('rect')
          .attr('fill', 'rgba(0, 0, 0, 0.8)')
          .attr('rx', 5)
          .attr('ry', 5);
        
        const text = tooltip.append('text')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('x', 8)
          .attr('y', 15);
        
        text.append('tspan')
          .attr('x', 8)
          .attr('dy', 0)
          .text(d.name);
        
        if (d.relationship) {
          text.append('tspan')
            .attr('x', 8)
            .attr('dy', 15)
            .text(`${d.relationship} • Strength: ${d.connectionStrength || 'N/A'}`);
        }
        
        const bbox = text.node().getBBox();
        rect.attr('width', bbox.width + 16).attr('height', bbox.height + 16);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('r', d.isCenter ? 25 : d.level === 1 ? 15 : 10);
        container.select('.tooltip').remove();
      });
    
    // Add labels
    const label = container.append('g')
      .selectAll('text')
      .data(networkData.nodes)
      .enter().append('text')
      .text(d => d.isCenter || d.level === 1 ? d.name.split(' ')[0] : '')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.isCenter ? 35 : 25)
      .attr('fill', '#333')
      .style('pointer-events', 'none');
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
    
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const getNetworkStats = () => {
    const stats = {
      totalConnections: networkData.nodes.filter(n => n.level === 1).length,
      secondDegreeConnections: networkData.nodes.filter(n => n.level === 2).length,
      averageConnectionStrength: 0,
      relationshipBreakdown: {},
      typeBreakdown: { model: 0, hiring: 0 }
    };
    
    const firstDegreeNodes = networkData.nodes.filter(n => n.level === 1);
    
    if (firstDegreeNodes.length > 0) {
      stats.averageConnectionStrength = Math.round(
        firstDegreeNodes.reduce((sum, n) => sum + (n.connectionStrength || 0), 0) / firstDegreeNodes.length
      );
    }
    
    firstDegreeNodes.forEach(node => {
      if (node.relationship) {
        stats.relationshipBreakdown[node.relationship] = (stats.relationshipBreakdown[node.relationship] || 0) + 1;
      }
      if (node.type) {
        stats.typeBreakdown[node.type]++;
      }
    });
    
    return stats;
  };

  const stats = getNetworkStats();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>
              Network Visualization 🕸️
            </h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Explore your professional network and connections
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentPage('dashboard')}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={onLogout}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 0, 0, 0.2)',
                color: '#ff6b6b',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
              <label style={{ color: '#ccc', fontSize: '14px', marginRight: '10px' }}>
                View Mode:
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              >
                <option value="network" style={{ background: '#333' }}>Network Graph</option>
                <option value="stats" style={{ background: '#333' }}>Statistics</option>
              </select>
            </div>
            
            <div>
              <label style={{ color: '#ccc', fontSize: '14px', marginRight: '10px' }}>
                Degrees of Separation:
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(parseInt(e.target.value))}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              >
                <option value="1" style={{ background: '#333' }}>1st Degree Only</option>
                <option value="2" style={{ background: '#333' }}>Up to 2nd Degree</option>
                <option value="3" style={{ background: '#333' }}>Up to 3rd Degree</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#667eea' }}></div>
              <span style={{ color: '#ccc', fontSize: '12px' }}>You</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff6b6b' }}></div>
              <span style={{ color: '#ccc', fontSize: '12px' }}>Models</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ecdc4' }}></div>
              <span style={{ color: '#ccc', fontSize: '12px' }}>Companies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '2fr 1fr' : '1fr', gap: '20px' }}>
          
          {/* Network Visualization or Stats */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '20px',
            minHeight: '600px'
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '600px',
                color: 'white',
                fontSize: '1.2rem'
              }}>
                Loading network data...
              </div>
            ) : viewMode === 'network' ? (
              <div>
                <h3 style={{ color: 'white', marginBottom: '20px' }}>Your Professional Network</h3>
                <svg ref={svgRef} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}></svg>
              </div>
            ) : (
              <div>
                <h3 style={{ color: 'white', marginBottom: '20px' }}>Network Statistics</h3>
                
                {/* Quick Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                      {stats.totalConnections}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Direct Connections</div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', color: '#2196F3', fontWeight: 'bold' }}>
                      {stats.secondDegreeConnections}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>2nd Degree</div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', color: '#FF9800', fontWeight: 'bold' }}>
                      {stats.averageConnectionStrength}%
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Avg. Strength</div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', color: '#E91E63', fontWeight: 'bold' }}>
                      {stats.totalConnections + stats.secondDegreeConnections}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Total Network</div>
                  </div>
                </div>

                {/* Relationship Breakdown */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ color: 'white', marginBottom: '15px' }}>Connections by Relationship</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {Object.entries(stats.relationshipBreakdown).map(([relationship, count]) => (
                      <div key={relationship} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px'
                      }}>
                        <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
                          {relationship.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Type Breakdown */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '20px',
                  borderRadius: '10px'
                }}>
                  <h4 style={{ color: 'white', marginBottom: '15px' }}>Connections by Type</h4>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 15px',
                      background: 'rgba(255, 107, 107, 0.2)',
                      borderRadius: '8px',
                      flex: 1
                    }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ff6b6b' }}></div>
                      <div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{stats.typeBreakdown.model}</div>
                        <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Models</div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 15px',
                      background: 'rgba(78, 205, 196, 0.2)',
                      borderRadius: '8px',
                      flex: 1
                    }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4ecdc4' }}></div>
                      <div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{stats.typeBreakdown.hiring}</div>
                        <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Companies</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'white', margin: 0 }}>Connection Details</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ccc',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: selectedNode.type === 'model' ? '#ff6b6b' : selectedNode.isCenter ? '#667eea' : '#4ecdc4',
                  margin: '0 auto 15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {selectedNode.name.charAt(0)}
                </div>
                
                <h4 style={{ color: 'white', textAlign: 'center', margin: '0 0 10px 0' }}>
                  {selectedNode.name}
                </h4>
                
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    background: selectedNode.type === 'model' ? 'rgba(255, 107, 107, 0.3)' : 'rgba(78, 205, 196, 0.3)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    {selectedNode.type === 'model' ? 'Model' : 'Company'}
                  </span>
                </div>
              </div>

              {!selectedNode.isCenter && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '5px' }}>Relationship</div>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>
                      {selectedNode.relationship?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '5px' }}>Connection Strength</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${selectedNode.connectionStrength || 0}%`,
                          background: 'linear-gradient(90deg, #4ecdc4, #44a08d)',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                      <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {selectedNode.connectionStrength || 0}%
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '5px' }}>Mutual Connections</div>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>
                      {selectedNode.mutualConnections || 0}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      onClick={() => setCurrentPage(`profile-${selectedNode.id}`)}
                      style={{
                        padding: '10px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      View Profile
                    </button>
                    
                    <button
                      style={{
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Send Message
                    </button>
                    
                    <button
                      style={{
                        padding: '10px',
                        background: 'rgba(78, 205, 196, 0.2)',
                        color: '#4ecdc4',
                        border: '1px solid rgba(78, 205, 196, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Request Introduction
                    </button>
                  </div>
                </>
              )}

              {selectedNode.isCenter && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '15px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '10px' }}>
                    This is your profile in the network
                  </div>
                  <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {stats.totalConnections} Direct Connections
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;