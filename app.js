document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Drawer Navigation ---
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      
      // Animate hamburger to X
      const bars = mobileToggle.querySelectorAll('.bar');
      if (mobileToggle.classList.contains('active')) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    // Close drawer when link clicked
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.querySelectorAll('.bar').forEach(bar => bar.style.transform = 'none');
        mobileToggle.querySelectorAll('.bar')[1].style.opacity = '1';
      });
    });
  }

  // --- Interactive Pricing Simulator (Hero Section) ---
  const compSlider = document.getElementById('slider-competitor');
  const demandSlider = document.getElementById('slider-demand');
  const stockSlider = document.getElementById('slider-stock');

  const compValText = document.getElementById('comp-val');
  const zapValText = document.getElementById('zap-val');
  const liftValText = document.getElementById('lift-val');

  const sliderCompLabel = document.getElementById('slider-comp-val');
  const sliderDemandLabel = document.getElementById('slider-demand-val');
  const sliderStockLabel = document.getElementById('slider-stock-val');

  const chartPathComp = document.getElementById('chart-path-comp');
  const chartPathZap = document.getElementById('chart-path-zap');
  const chartAreaZap = document.getElementById('chart-area-zap');
  const chartPoint = document.getElementById('chart-point');

  function updatePricingSimulator() {
    const compVal = parseInt(compSlider.value);
    const demandVal = parseInt(demandSlider.value);
    const stockVal = parseInt(stockSlider.value);

    // 1. Calculate values for display
    // Competitor Base Price is ₹4000, varies up to ₹10000
    const competitorPrice = 4000 + (compVal * 60);
    
    // PriceZap AI calculates optimal price based on competitor price, demand, and inventory
    // If inventory is high (overstock), AI lowers price to liquidate
    // If demand is high, AI can capture higher margin
    // AI avoids direct price war unless overstocked
    const demandMultiplier = 1 + ((demandVal - 50) / 250); // -20% to +20%
    const stockDiscount = ((stockVal - 50) / 100) * 1500; // -₹750 to +₹750 price shift
    
    let zapPrice = competitorPrice * demandMultiplier - stockDiscount;
    // Keep pricing realistic
    if (zapPrice < 2500) zapPrice = 2500;
    if (zapPrice > 15000) zapPrice = 15000;

    // Projected Lift Calculation
    // Lift is maximized when pricing is optimized compared to raw competitor matches
    const liftBase = 8.5;
    const demandLift = (demandVal / 100) * 12;
    const inventoryLift = ((100 - stockVal) / 100) * 8;
    const lift = liftBase + demandLift + inventoryLift + (Math.abs(zapPrice - competitorPrice) * 0.15);

    // Update Text Elements
    compValText.textContent = `₹${Math.round(competitorPrice).toLocaleString('en-IN')}`;
    zapValText.textContent = `₹${Math.round(zapPrice).toLocaleString('en-IN')}`;
    liftValText.textContent = `+${lift.toFixed(1)}%`;

    // Update E-commerce Product Mock Card
    const prodCurrentPrice = document.getElementById('prod-current-price');
    if (prodCurrentPrice) {
      prodCurrentPrice.textContent = `₹${Math.round(zapPrice).toLocaleString('en-IN')}`;
    }

    const stockStatusText = document.getElementById('stock-status-text');
    const stockDot = document.getElementById('stock-dot-indicator');
    if (stockStatusText && stockDot) {
      const units = Math.round(150 - (stockVal * 1.3));
      stockStatusText.textContent = `In Stock (${units} units)`;
      
      if (units < 20) {
        stockStatusText.textContent = `Low Stock (${units} units)`;
        stockDot.style.backgroundColor = '#ef4444';
        stockDot.style.boxShadow = '0 0 8px #ef4444';
      } else if (units < 60) {
        stockDot.style.backgroundColor = '#f59e0b';
        stockDot.style.boxShadow = '0 0 8px #f59e0b';
      } else {
        stockDot.style.backgroundColor = '#00ff66';
        stockDot.style.boxShadow = '0 0 8px #00ff66';
      }
    }

    // Update Slider Label Details
    if (compVal < 30) {
      sliderCompLabel.textContent = "Aggressive Discount";
    } else if (compVal > 70) {
      sliderCompLabel.textContent = "Premium Matching";
    } else {
      sliderCompLabel.textContent = "Standard Market";
    }

    if (demandVal < 30) {
      sliderDemandLabel.textContent = "Price Sensitive";
    } else if (demandVal > 70) {
      sliderDemandLabel.textContent = "Surging Volume";
    } else {
      sliderDemandLabel.textContent = "Stable Demand";
    }

    if (stockVal < 30) {
      sliderStockLabel.textContent = "Low Stock (Maximize Margin)";
    } else if (stockVal > 70) {
      sliderStockLabel.textContent = "Overstock (Push Velocity)";
    } else {
      sliderStockLabel.textContent = "Healthy Levels";
    }

    // 2. Redraw SVG Chart Paths
    // SVG Dimensions: 400 width, 180 height
    // Draw waves representing historical/trend lines
    const pointsCount = 6;
    const width = 400;
    const height = 180;
    const step = width / (pointsCount - 1);
    
    let compPoints = [];
    let zapPoints = [];

    // Helper: Map price to SVG Y position (Y runs 0 to 180, higher price is lower Y)
    function priceToY(price) {
      const minP = 2000;
      const maxP = 16000;
      return height - 20 - ((price - minP) / (maxP - minP)) * (height - 40);
    }

    for (let i = 0; i < pointsCount; i++) {
      const x = i * step;
      
      // Create organic looking wave shapes
      const compWave = Math.sin(i * 1.5) * 8 + Math.cos(i * 0.8) * 4;
      const compP = competitorPrice + compWave;
      const compY = priceToY(compP);
      compPoints.push({ x, y: compY });

      // PriceZap AI curve adapts dynamically to competitor trends and optimizer states
      const zapWave = Math.cos(i * 1.2) * 5 + Math.sin(i * 0.9) * 3;
      // AI adjusts lead-lag logic dynamically per step
      let stepZapPrice = zapPrice + zapWave;
      
      // In steps 1-3 AI might observe and react, steps 4-5 optimize
      if (i < 3) {
        stepZapPrice = (competitorPrice * 0.96) + zapWave + (demandVal * 0.05) - (stockVal * 0.05);
      }
      
      const zapY = priceToY(stepZapPrice);
      zapPoints.push({ x, y: zapY });
    }

    // Construct SVG path strings (Catmull-Rom or cubic spline approximations using Bezier)
    function buildPath(points) {
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        // Control points for smooth bezier connection
        const cpX1 = p0.x + step / 2;
        const cpY1 = p0.y;
        const cpX2 = p1.x - step / 2;
        const cpY2 = p1.y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
      return path;
    }

    const pathCompStr = buildPath(compPoints);
    const pathZapStr = buildPath(zapPoints);

    chartPathComp.setAttribute('d', pathCompStr);
    chartPathZap.setAttribute('d', pathZapStr);

    // Area under AI curve (closes path to bottom right, bottom left, and back to start)
    const areaZapStr = `${pathZapStr} L ${width} ${height} L 0 ${height} Z`;
    chartAreaZap.setAttribute('d', areaZapStr);

    // Place the highlight cursor point on the active peak (index 4 out of 5)
    const highlightPoint = zapPoints[4];
    chartPoint.setAttribute('cx', highlightPoint.x);
    chartPoint.setAttribute('cy', highlightPoint.y);
  }

  // Event Listeners for Simulator Sliders
  if (compSlider && demandSlider && stockSlider) {
    [compSlider, demandSlider, stockSlider].forEach(slider => {
      slider.addEventListener('input', updatePricingSimulator);
    });
    // Init on load
    updatePricingSimulator();
  }

  // --- Excel/CSV Catalog Upload Handling ---
  const csvFile = document.getElementById('csv-file');
  const fileName = document.getElementById('file-name');

  if (csvFile) {
    csvFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      fileName.textContent = file.name;

      // Parse CSV File in Browser
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
          const data = results.data;
          
          // Filter out rows missing core details
          const validProducts = data.filter(row => row.product_name && row.price);
          
          if (validProducts.length > 0) {
            showToast(`Successfully parsed CSV! Loaded ${validProducts.length} products.`, 'success');
            
            // Extract details of the first product
            const firstProd = validProducts[0];
            
            // Map details to catalog sneaker card
            const prodName = document.querySelector('.product-name');
            const prodCurrentPrice = document.getElementById('prod-current-price');
            const compValText = document.getElementById('comp-val');
            
            if (prodName) prodName.textContent = firstProd.product_name;
            if (prodCurrentPrice) prodCurrentPrice.textContent = `₹${firstProd.price.toLocaleString('en-IN')}`;
            
            // Competitor price calculation
            const compPrice = firstProd.competitor_price || (firstProd.price * 1.12);
            if (compValText) compValText.textContent = `₹${Math.round(compPrice).toLocaleString('en-IN')}`;
            
            // Map stock levels (say 0-150 range) to the stock slider value (0-100 scale)
            if (firstProd.stock !== undefined) {
              const stockSlider = document.getElementById('slider-stock');
              if (stockSlider) {
                // Convert stock quantity into percentage slider index
                const stockPercent = Math.min(100, Math.round(((150 - firstProd.stock) / 1.3)));
                stockSlider.value = stockPercent;
              }
            }
            
            // Recalculate optimizer outputs based on the new data
            updatePricingSimulator();
          } else {
            showToast("No valid products found. Make sure your CSV file has 'product_name' and 'price' as headers.", 'warning');
          }
        }
      });
    });
  }

  // --- Interactive ROI Calculator ---
  const salesSlider = document.getElementById('monthly-sales');
  const hoursSlider = document.getElementById('pricing-hours');
  const salesValText = document.getElementById('sales-val');
  const hoursValText = document.getElementById('hours-val');
  const gainRevText = document.getElementById('gain-rev');
  const gainTimeText = document.getElementById('gain-time');
  const gainMarginText = document.getElementById('gain-margin');

  function formatCurrency(value) {
    if (value >= 10000000) { // 1 Crore = 10,000,000
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) { // 1 Lakh = 100,000
      return `₹${(value / 100000).toFixed(1)} Lakh`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  }

  function updateCalculator() {
    const monthlySales = parseInt(salesSlider.value);
    const pricingHours = parseInt(hoursSlider.value);

    // Display inputs
    salesValText.textContent = formatCurrency(monthlySales);
    hoursValText.textContent = `${pricingHours} hours`;

    // Compute Outputs
    const revenueGain = monthlySales * 0.12;
    const monthlyHoursReclaimed = Math.round(pricingHours * 4.33 * 0.65); // 65% reduction

    // Calculate gross margin increase
    let marginIncreasePercent = 12.0 + (monthlySales / 10000000) * 1.0;
    if (marginIncreasePercent > 18.0) marginIncreasePercent = 18.0;

    // Update outputs
    gainRevText.textContent = formatCurrency(Math.round(revenueGain));
    gainTimeText.textContent = `${monthlyHoursReclaimed} hours`;
    gainMarginText.textContent = `+${marginIncreasePercent.toFixed(1)}%`;
  }

  if (salesSlider && hoursSlider) {
    salesSlider.addEventListener('input', updateCalculator);
    hoursSlider.addEventListener('input', updateCalculator);
    // Init on load
    updateCalculator();
  }

  // --- Testimonials Carousel ---
  const track = document.getElementById('testimonial-track');
  const slides = Array.from(track ? track.children : []);
  const nextButton = document.getElementById('next-testimonial');
  const prevButton = document.getElementById('prev-testimonial');
  const dotsContainer = document.getElementById('carousel-dots');
  const dots = Array.from(dotsContainer ? dotsContainer.children : []);

  let currentIndex = 0;
  let autoSlideTimer;

  function updateCarousel(index) {
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    currentIndex = index;
    
    // Clamp/wrap boundaries
    if (currentIndex >= slides.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = slides.length - 1;

    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
  }

  if (nextButton && prevButton && dotsContainer) {
    nextButton.addEventListener('click', () => {
      resetTimer();
      updateCarousel(currentIndex + 1);
    });

    prevButton.addEventListener('click', () => {
      resetTimer();
      updateCarousel(currentIndex - 1);
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        resetTimer();
        updateCarousel(idx);
      });
    });

    function startTimer() {
      autoSlideTimer = setInterval(() => {
        updateCarousel(currentIndex + 1);
      }, 7000);
    }

    function resetTimer() {
      clearInterval(autoSlideTimer);
      startTimer();
    }

    startTimer();
  }

  // --- Reveal Animations on Scroll (Intersection Observer) ---
  const animateElements = document.querySelectorAll(
    '.feature-card, .step-card, .stat-card, .result-card, .calc-box, .comparison-table-wrapper'
  );

  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    revealObserver.observe(el);
  });

  const style = document.createElement('style');
  style.innerHTML = `
    .revealed {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  // ============ DYNAMIC DASHBOARD PREVIEW LOGIC ============
  
  // --- Mock Database (Products Data) ---
  const products = [
    { 
      id: 1, 
      name: "Apex Pro Shoes", 
      base_price: 3000, 
      price: 4499, 
      competitor_price: 4299, 
      stock: 80, 
      demand_elasticity: 50, 
      status: "Overpriced" 
    },
    { 
      id: 2, 
      name: "Running Shorts", 
      base_price: 800, 
      price: 1199, 
      competitor_price: 1250, 
      stock: 120, 
      demand_elasticity: 75, 
      status: "Underpriced" 
    },
    { 
      id: 3, 
      name: "Sports Socks", 
      base_price: 400, 
      price: 899, 
      competitor_price: 900, 
      stock: 35, 
      demand_elasticity: 45, 
      status: "Optimal" 
    },
    { 
      id: 4, 
      name: "Gym Bag Pro", 
      base_price: 1500, 
      price: 2199, 
      competitor_price: 2450, 
      stock: 15, 
      demand_elasticity: 80, 
      status: "Overpriced" 
    }
  ];

  let selectedProductId = 1;

  // --- Elements ---
  const attentionList = document.getElementById('attention-list');
  const barChartRender = document.getElementById('bar-chart-render');
  const kpiRevenue = document.getElementById('kpi-revenue');
  const kpiOrders = document.getElementById('kpi-orders');
  const kpiAvgPrice = document.getElementById('kpi-avgprice');
  const kpiChanges = document.getElementById('kpi-changes');
  const runOptimizerBtn = document.getElementById('btn-run-optimizer');

  // --- Core Dynamic Pricing Math Logic ---
  function calculateProductOptimal(prod) {
    const competitorPrice = prod.competitor_price;
    const elasticity = prod.demand_elasticity;
    const stock = prod.stock;

    // Demand pricing factor: high elasticity = capture premium margins, low elasticity = lower price
    const demandMultiplier = 1 + ((elasticity - 50) / 330);

    // Stock liquidation factor: low units = raise price, overstock = discount
    let stockFactor = 0;
    if (stock < 30) {
      stockFactor = (30 - stock) * 15; // raise price
    } else if (stock > 70) {
      stockFactor = -(stock - 70) * 12; // lower price
    }

    let optimalPrice = competitorPrice * demandMultiplier + stockFactor;

    // Floor guardrail: cost price + 8% margin
    const floorPrice = prod.base_price * 1.08;
    if (optimalPrice < floorPrice) {
      optimalPrice = floorPrice;
    }

    // Determine status badge
    let status = "Optimal";
    const percentDiff = ((prod.price - optimalPrice) / optimalPrice) * 100;
    if (percentDiff > 5) {
      status = "Overpriced";
    } else if (percentDiff < -5) {
      status = "Underpriced";
    }

    return {
      price: Math.round(optimalPrice),
      status: status
    };
  }

  // --- Render Products List ---
  function renderProductsList() {
    if (!attentionList) return;
    attentionList.innerHTML = '';
    
    products.forEach(prod => {
      const item = document.createElement('div');
      item.className = `dp-prod-row ${prod.id === selectedProductId ? 'active-prod' : ''}`;
      item.dataset.id = prod.id;
      item.style.cursor = 'pointer';
      
      const badgeClass = prod.status === 'Optimal' ? 'ok' : (prod.status === 'Overpriced' ? 'over' : 'under');
      const badgeIcon = prod.status === 'Optimal' ? 'Optimal' : prod.status;

      item.innerHTML = `
        <div>
          <div class="dp-prod-name">${prod.name}</div>
          <div class="dp-prod-rec">AI rec: ₹${prod.price.toLocaleString('en-IN')}</div>
        </div>
        <span class="mini-badge ${badgeClass}">${badgeIcon}</span>
      `;

      item.addEventListener('click', () => {
        selectedProductId = prod.id;
        renderProductsList();
        updateDashboardKPIs();
      });

      attentionList.appendChild(item);
    });
  }

  // --- Calculate Dashboard Telemetrics ---
  function updateDashboardKPIs() {
    const activeProd = products.find(p => p.id === selectedProductId);
    if (activeProd) {
      const calculations = calculateProductOptimal(activeProd);
      activeProd.price = calculations.price;
      activeProd.status = calculations.status;
    }

    // Compute Dashboard Averages
    let totalRevenue = 210000;
    let totalOrders = 1750;
    let totalPriceSum = 0;
    let aiChanges = 120;

    products.forEach(p => {
      totalPriceSum += p.price;
      if (p.status !== 'Optimal') {
        aiChanges += 6;
      }
    });

    const averagePrice = Math.round(totalPriceSum / products.length);

    // Dynamic metrics reaction to selected product's adjustments
    const revenueShift = activeProd ? Math.round((activeProd.price / 4000) * 30000) : 0;
    const orderShift = activeProd ? Math.round((activeProd.stock / 80) * 97) : 0;

    if (kpiRevenue) {
      kpiRevenue.textContent = `₹${((totalRevenue + revenueShift) / 100000).toFixed(1)}L`;
    }
    if (kpiOrders) {
      kpiOrders.textContent = (totalOrders + orderShift).toLocaleString('en-IN');
    }
    if (kpiAvgPrice) {
      kpiAvgPrice.textContent = `₹${averagePrice.toLocaleString('en-IN')}`;
    }
    if (kpiChanges) {
      kpiChanges.textContent = aiChanges;
    }

    // Redraw chart
    if (activeProd) {
      renderRevenueChart(activeProd.price, activeProd.demand_elasticity);
    }
  }

  // --- Render 7-day Revenue Chart bars ---
  function renderRevenueChart(activePrice, activeDemand) {
    if (!barChartRender) return;
    barChartRender.innerHTML = '';
    
    // 7 mock base data levels
    const baseDays = [14000, 18000, 15000, 22000, 28000, 32000, 29000];
    
    // Distort chart based on current configurations
    const modifier = (activePrice / 5000) * (activeDemand / 50);

    baseDays.forEach((val, index) => {
      const adjustedVal = Math.round(val * modifier);
      const heightPercent = Math.min(100, Math.max(10, Math.round((adjustedVal / 45000) * 100)));

      const bar = document.createElement('div');
      const isActive = index >= 4;
      bar.className = `dp-bar ${isActive ? 'active' : ''}`;
      bar.style.height = `${heightPercent}%`;
      bar.title = `₹${adjustedVal.toLocaleString('en-IN')}`;

      barChartRender.appendChild(bar);
    });
  }

  // --- Run Optimizer Animation Sequence ---
  async function runOptimizer() {
    if (!runOptimizerBtn) return;
    runOptimizerBtn.disabled = true;
    runOptimizerBtn.innerHTML = `
      <svg class="btn-icon spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      Optimizing...
    `;

    // Play flash animations on list
    let count = 0;
    const interval = setInterval(() => {
      products.forEach(p => {
        p.status = Math.random() > 0.5 ? 'Optimal' : 'Underpriced';
      });
      renderProductsList();
      count++;
    }, 150);

    try {
      // Fetch sync updates from local backend API
      const response = await fetch('http://localhost:5000/api/pricing/sync-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      clearInterval(interval);

      if (result.success) {
        // Sync our local state with the actual backend database responses
        result.details.forEach(update => {
          const localProd = products.find(p => p.id === update.product_id);
          if (localProd) {
            localProd.price = update.new_price;
            localProd.competitor_price = update.competitor_price;
            localProd.status = 'Optimal';
          }
        });

        // Set all other unchanged products to Optimal
        products.forEach(p => {
          if (!result.details.some(u => u.product_id === p.id)) {
            p.status = 'Optimal';
          }
        });

        renderProductsList();
        updateDashboardKPIs();
        
        // Show actual API update metrics in toast
        showToast(`Pricing Optimized! Sync complete. ${result.updated_skus} SKU changes applied.`, "success");
      } else {
        throw new Error(result.error || 'Failed to sync');
      }

    } catch (err) {
      // Fallback: If backend server is offline/unavailable, gracefully run client simulation
      console.warn('Backend server offline. Running simulated rules optimization. Error:', err.message);
      
      setTimeout(() => {
        clearInterval(interval);
        
        // Finalize all products to OPTIMAL state simulation
        products.forEach(p => {
          p.status = 'Optimal';
          p.price = p.competitor_price;
        });

        renderProductsList();
        updateDashboardKPIs();
        showOptimizerToast(); // standard client-side toast fallback
      }, Math.max(100, 1000 - (count * 150)));
    } finally {
      setTimeout(() => {
        runOptimizerBtn.disabled = false;
        runOptimizerBtn.innerHTML = `
          <svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Run optimizer
        `;
      }, 200);
    }
  }

  // --- Toast Notification System ---
  function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon toast-icon-success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg class="toast-icon toast-icon-warning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon toast-icon-error" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }, 400);
    }, 4000);
  }

  function showOptimizerToast() {
    showToast("Pricing Optimized! 12 SKU conflicts auto-resolved.", "success");
  }

  // --- Initialize Dashboard State ---
  if (runOptimizerBtn) {
    runOptimizerBtn.addEventListener('click', runOptimizer);
  }
  renderProductsList();
  updateDashboardKPIs();

  // ============ LOGIN MODAL & SESSION CONTROL ============
  
  const loginModal = document.getElementById('login-modal');
  const closeLoginBtn = document.getElementById('close-login-btn');
  const loginForm = document.getElementById('login-form');
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  
  // Header Elements
  const headerSigninBtn = document.getElementById('header-signin-btn');
  const headerSignupBtn = document.getElementById('header-signup-btn');
  const userProfile = document.getElementById('user-profile');
  const logoutBtn = document.getElementById('logout-btn');
  
  // Mobile elements
  const drawerSigninItem = document.querySelector('.drawer-signin-item');
  const drawerSignupItem = document.querySelector('.drawer-signup-item');
  const drawerUserItem = document.querySelector('.drawer-user-item');
  const logoutMobileBtn = document.querySelector('.btn-logout-mobile');

  // Trigger elements
  const signinTriggers = document.querySelectorAll('.signin-trigger');
  
  // Open Modal
  signinTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginModal) {
        loginModal.classList.add('open');
        const emailInput = document.getElementById('login-email');
        if (emailInput) emailInput.focus();
      }
    });
  });

  // Close Modal (Close button or click overlay background)
  function closeLoginModal() {
    if (loginModal) {
      loginModal.classList.remove('open');
      if (loginForm) loginForm.reset();
    }
  }

  if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', closeLoginModal);
  }

  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        closeLoginModal();
      }
    });
  }

  // Handle Escape Key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal && loginModal.classList.contains('open')) {
      closeLoginModal();
    }
  });

  // Form Submit Handler (Mock validation and session updates)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      
      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.innerHTML = `
          <svg class="btn-icon spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          Signing in...
        `;
      }

      // Mock API latency
      setTimeout(() => {
        // Reset submit button state
        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.innerHTML = 'Sign in';
        }

        // Close modal
        closeLoginModal();

        // Extract first name for greeting customization
        const username = email.split('@')[0];
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

        // Update active user profile details in layout
        const userAvatars = document.querySelectorAll('.user-avatar');
        const userNames = document.querySelectorAll('.user-name');
        
        userAvatars.forEach(avatar => avatar.textContent = formattedName.substring(0, 2).toUpperCase());
        if (userNames[0]) userNames[0].textContent = formattedName;
        if (userNames[1]) userNames[1].textContent = formattedName + ' Thakur';

        // Swap Header Elements (Header session state)
        if (headerSigninBtn) headerSigninBtn.style.display = 'none';
        if (headerSignupBtn) headerSignupBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';

        // Swap Mobile Drawer Navigation Elements
        if (drawerSigninItem) drawerSigninItem.style.display = 'none';
        if (drawerSignupItem) drawerSignupItem.style.display = 'none';
        if (drawerUserItem) drawerUserItem.style.display = 'flex';

        // Dynamically update dashboard greeting to match logged-in user
        const greetingUserLabel = document.querySelector('.greeting-user');
        if (greetingUserLabel) {
          greetingUserLabel.textContent = `Good morning, ${formattedName}`;
        }

        // Show welcome toast notification
        showToast(`Welcome back, ${formattedName}! Redirecting to dashboard...`, 'success');

      }, 1500);
    });
  }

  // Handle Logout Logic
  function handleLogout() {
    // Show logout toast
    showToast("Logged out successfully.", "info");

    // Restore Header State
    if (headerSigninBtn) headerSigninBtn.style.display = 'inline-block';
    if (headerSignupBtn) headerSignupBtn.style.display = 'inline-block';
    if (userProfile) userProfile.style.display = 'none';

    // Restore Mobile Drawer State
    if (drawerSigninItem) drawerSigninItem.style.display = 'block';
    if (drawerSignupItem) drawerSignupItem.style.display = 'block';
    if (drawerUserItem) drawerUserItem.style.display = 'none';

    // Restore default greeting details
    const greetingUserLabel = document.querySelector('.greeting-user');
    if (greetingUserLabel) {
      greetingUserLabel.textContent = 'Good morning, Harshit';
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  if (logoutMobileBtn) {
    logoutMobileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});
