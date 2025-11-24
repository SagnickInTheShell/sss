// Theme Toggle
        function toggleTheme() {
            const root = document.documentElement;
            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            document.querySelector('.theme-toggle').textContent = newTheme === 'dark' ? '🌙' : '☀️';
            
            updateChartTheme();
        }

        // Load saved theme
        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.querySelector('.theme-toggle').textContent = savedTheme === 'dark' ? '🌙' : '☀️';
        });

        // Mathematical Functions
        function factorial(n) {
            if (n <= 1) return 1;
            return n * factorial(n - 1);
        }

        function binomialCoefficient(n, k) {
            if (k > n) return 0;
            if (k === 0 || k === n) return 1;
            return factorial(n) / (factorial(k) * factorial(n - k));
        }

        function binomialPMF(n, p, k) {
            const coef = binomialCoefficient(n, k);
            return coef * Math.pow(p, k) * Math.pow(1 - p, n - k);
        }

        function binomialCDF(n, p, k) {
            let sum = 0;
            for (let i = 0; i <= k; i++) {
                sum += binomialPMF(n, p, i);
            }
            return sum;
        }

        function calculateMode(n, p) {
            return Math.floor((n + 1) * p);
        }

        // Chart Setup
        let pmfChart, cdfChart;

        function getChartColors() {
            const theme = document.documentElement.getAttribute('data-theme');
            return {
                text: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                accent: '#f59e42',
                accentSecondary: '#f57842'
            };
        }

        function initCharts() {
            const colors = getChartColors();
            
            const pmfCtx = document.getElementById('pmf-chart').getContext('2d');
            pmfChart = new Chart(pmfCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Probability',
                        data: [],
                        backgroundColor: colors.accent,
                        borderColor: colors.accentSecondary,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: colors.text }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: colors.grid },
                            ticks: { color: colors.text }
                        },
                        y: {
                            grid: { color: colors.grid },
                            ticks: { color: colors.text },
                            beginAtZero: true
                        }
                    }
                }
            });

            const cdfCtx = document.getElementById('cdf-chart').getContext('2d');
            cdfChart = new Chart(cdfCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Cumulative Probability',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 66, 0.2)',
                        borderColor: colors.accent,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: colors.text }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: colors.grid },
                            ticks: { color: colors.text }
                        },
                        y: {
                            grid: { color: colors.grid },
                            ticks: { color: colors.text },
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            });
        }

        function updateChartTheme() {
            const colors = getChartColors();
            
            [pmfChart, cdfChart].forEach(chart => {
                chart.options.plugins.legend.labels.color = colors.text;
                chart.options.scales.x.grid.color = colors.grid;
                chart.options.scales.x.ticks.color = colors.text;
                chart.options.scales.y.grid.color = colors.grid;
                chart.options.scales.y.ticks.color = colors.text;
                chart.update();
            });
        }

        // Update calculations and charts
        function updateCalculations() {
            const n = parseInt(document.getElementById('n-input').value);
            const p = parseFloat(document.getElementById('p-input').value);
            const k = parseInt(document.getElementById('k-input').value);

            // Update k slider max
            document.getElementById('k-slider').max = n;
            if (k > n) {
                document.getElementById('k-slider').value = n;
                document.getElementById('k-input').value = n;
            }

            // Calculate statistics
            const pmf = binomialPMF(n, p, k);
            const cdf = binomialCDF(n, p, k);
            const mean = n * p;
            const variance = n * p * (1 - p);
            const stddev = Math.sqrt(variance);
            const mode = calculateMode(n, p);

            // Update results
            document.getElementById('pmf-result').textContent = pmf.toFixed(4);
            document.getElementById('cdf-result').textContent = cdf.toFixed(4);
            document.getElementById('mean-result').textContent = mean.toFixed(2);
            document.getElementById('variance-result').textContent = variance.toFixed(2);
            document.getElementById('stddev-result').textContent = stddev.toFixed(2);
            document.getElementById('mode-result').textContent = mode;

            // Update charts
            updateCharts(n, p, k);
        }

        function updateCharts(n, p, k) {
            const labels = [];
            const pmfData = [];
            const cdfData = [];

            for (let i = 0; i <= n; i++) {
                labels.push(i);
                pmfData.push(binomialPMF(n, p, i));
                cdfData.push(binomialCDF(n, p, i));
            }

            // Highlight selected k
            const colors = pmfData.map((_, i) => i === k ? '#f57842' : '#f59e42');

            pmfChart.data.labels = labels;
            pmfChart.data.datasets[0].data = pmfData;
            pmfChart.data.datasets[0].backgroundColor = colors;
            pmfChart.update('none');

            cdfChart.data.labels = labels;
            cdfChart.data.datasets[0].data = cdfData;
            cdfChart.update('none');
        }

        // Synchronize inputs
        function syncInputs(sliderId, inputId, valueId, decimals = 0) {
            const slider = document.getElementById(sliderId);
            const input = document.getElementById(inputId);
            const valueDisplay = document.getElementById(valueId);

            slider.addEventListener('input', (e) => {
                const value = decimals > 0 ? parseFloat(e.target.value) : parseInt(e.target.value);
                input.value = value;
                valueDisplay.textContent = decimals > 0 ? value.toFixed(decimals) : value;
                updateCalculations();
            });

            input.addEventListener('input', (e) => {
                const value = decimals > 0 ? parseFloat(e.target.value) : parseInt(e.target.value);
                slider.value = value;
                valueDisplay.textContent = decimals > 0 ? value.toFixed(decimals) : value;
                updateCalculations();
            });
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            initCharts();
            syncInputs('n-slider', 'n-input', 'n-value');
            syncInputs('p-slider', 'p-input', 'p-value', 2);
            syncInputs('k-slider', 'k-input', 'k-value');
            updateCalculations();
        });