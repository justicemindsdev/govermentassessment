const fs = require('fs');

// Read the kajha.html file
fs.readFile('kajha.html', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Find the start of the script section
  const scriptStartIndex = data.lastIndexOf('<script>');
  
  if (scriptStartIndex === -1) {
    console.error('Script tag not found');
    return;
  }

  // Find the end of the HTML content (before the script section)
  const htmlEndIndex = data.lastIndexOf('</div>', scriptStartIndex);
  
  if (htmlEndIndex === -1) {
    console.error('HTML end not found');
    return;
  }

  // Extract the HTML content and the proper script content
  const htmlContent = data.substring(0, htmlEndIndex + 6); // +6 to include '</div>'
  
  // Create a clean script section with the proper JavaScript
  const cleanScript = `
    <script>
        // Handle dark mode toggle
        document.addEventListener('DOMContentLoaded', function() {
            // Dark mode functions
            function setDarkMode(isDark) {
                if (isDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
            
            // Check user preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setDarkMode(true);
            }
            
            // Listen for changes in preference
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                setDarkMode(event.matches);
            });
            
            // Toggle button
            document.getElementById('darkModeToggle').addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
            });
            
            // Initialize variables
            let skillsChart;
            let chartRotation = 0;
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            
            // Initialize skills chart
            function initSkillsChart() {
                if (skillsChart) return; // Prevent multiple initializations
                
                const ctx = document.getElementById('skillsChart').getContext('2d');
                
                // Create gradient
                const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
                gradientFill.addColorStop(0, 'rgba(93, 92, 222, 0.3)');
                gradientFill.addColorStop(1, 'rgba(79, 70, 229, 0.1)');
                
                skillsChart = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: [
                            'Cross-Cultural Intelligence',
                            'Psychological Intervention',
                            'Systemic Navigation',
                            'Metacognitive Awareness',
                            'Business Model Innovation',
                            'Strategic Communication'
                        ],
                        datasets: [{
                            label: 'Ben\\'s Skills (percentile)',
                            data: [95, 90, 85, 93, 80, 92],
                            fill: true,
                            backgroundColor: gradientFill,
                            borderColor: '#5D5CDE',
                            borderWidth: 3,
                            pointBackgroundColor: '#5D5CDE',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#5D5CDE',
                            pointRadius: 5,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    font: {
                                        size: 14
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                titleColor: '#5D5CDE',
                                bodyColor: '#333',
                                borderColor: '#5D5CDE',
                                borderWidth: 1,
                                padding: 12,
                                displayColors: false,
                                titleFont: {
                                    size: 16,
                                    weight: 'bold'
                                },
                                bodyFont: {
                                    size: 14
                                },
                                callbacks: {
                                    title: function(tooltipItems) {
                                        return tooltipItems[0].label;
                                    },
                                    label: function(context) {
                                        return \`Score: \${context.raw}%\`;
                                    }
                                }
                            }
                        },
                        scales: {
                            r: {
                                angleLines: {
                                    display: true,
                                    color: 'rgba(93, 92, 222, 0.2)'
                                },
                                grid: {
                                    color: 'rgba(93, 92, 222, 0.1)'
                                },
                                pointLabels: {
                                    font: {
                                        size: 12,
                                        weight: 'bold'
                                    }
                                },
                                suggestedMin: 0,
                                suggestedMax: 100,
                                ticks: {
                                    backdropColor: 'transparent',
                                    color: '#666',
                                    z: 100
                                }
                            }
                        },
                        elements: {
                            line: {
                                tension: 0.1
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'easeOutQuart'
                        }
                    }
                });
            }
            
            // Rotate chart function
            function rotateChart() {
                if (!skillsChart) return;
                
                chartRotation += 60;
                skillsChart.options.rotation = chartRotation * Math.PI / 180;
                skillsChart.update();
            }
            
            // Highlight the "I'm important" quote
            function highlightQuote() {
                const importantQuote = document.getElementById('importantQuote');
                if (importantQuote) {
                    importantQuote.classList.add('highlight');
                    setTimeout(() => {
                        importantQuote.classList.remove('highlight');
                    }, 3000);
                }
            }
            
            // Animate progress bars
            function animateProgressBars() {
                const progressBars = document.querySelectorAll('.overflow-hidden .shadow-none');
                progressBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0';
                    bar.classList.add('animate-progress');
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
            }
            
            // Tab navigation
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all tabs
                    tabBtns.forEach(b => {
                        b.classList.remove('bg-primary', 'text-white', 'shadow-md');
                        b.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-700');
                    });
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    btn.classList.add('bg-primary', 'text-white', 'shadow-md');
                    btn.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');
                    const tabId = btn.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                    
                    // Run tab-specific animations
                    if (tabId === 'overview') {
                        setTimeout(animateProgressBars, 300);
                        setTimeout(() => {
                            if (!skillsChart) {
                                initSkillsChart();
                            }
                        }, 300);
                    } else if (tabId === 'transformation') {
                        setTimeout(highlightQuote, 300);
                    }
                });
            });
            
            // Show more matrices button
            document.getElementById('showMoreMatrices').addEventListener('click', function() {
                const extraMatrices = document.getElementById('extraMatrices');
                const button = document.getElementById('showMoreMatrices');
                
                if (extraMatrices.classList.contains('hidden')) {
                    extraMatrices.classList.remove('hidden');
                    button.innerHTML = '<i class="fas fa-chevron-up mr-2"></i><span>Show Less</span>';
                } else {
                    extraMatrices.classList.add('hidden');
                    button.innerHTML = '<i class="fas fa-chevron-down mr-2"></i><span>Show More Transformation Matrices</span>';
                }
            });
            
            // Rotate chart button
            document.getElementById('rotateChartBtn').addEventListener('click', rotateChart);
            
            // Initialize the page
            initSkillsChart();
            animateProgressBars();
        });
    </script>
</body>
</html>`;

  // Combine the HTML content with the clean script
  const cleanedContent = htmlContent + cleanScript;

  // Write the cleaned content back to the file
  fs.writeFile('kajha.html', cleanedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully cleaned kajha.html');
  });
});
