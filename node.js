const puppeteer = require('puppeteer');

(async () => {
  
  const browser = await puppeteer.launch({
    headless: false, 
    args: ['--window-size=1860,1024']
  });
  
  const page = await browser.newPage();

  await page.setViewport({ width: 1860, height: 1024 });

  await page.goto('https://www.mercadolibre.com', { waitUntil: 'networkidle2' });

 // Seleccionar país: México
try {
    await page.waitForSelector('a#MX', { timeout: 60000 });
    await Promise.all([
      page.click('a#MX'),
      page.waitForSelector('input[name="as_word"]', { timeout: 60000 }) 
    ]);
    await page.screenshot({ path: 'Seleccionar_Pais.png' });
  } catch (error) {
    console.error('Error al seleccionar el país:', error);
    await page.screenshot({ path: 'error_seleccionar_pais.png' });
    await browser.close();
    return;
  }
  

  // Buscar "playstation 5"
  try {
    await page.waitForSelector('input[name="as_word"]', { timeout: 60000 });
    const searchInput = await page.$('input[name="as_word"]');
    await searchInput.click({ clickCount: 3 }); 
    await searchInput.type('playstation 5', { delay: 100 }); 
    await page.keyboard.press('Enter'); 
    await page.waitForNavigation({ waitUntil: 'networkidle2' }); 
    await page.screenshot({ path: 'Buscar_Producto.png' });
  } catch (error) {
    console.error('Error al buscar el producto:', error);
    await page.screenshot({ path: 'error_buscar_producto.png' });
    await browser.close();
    return;
  }

  // Filtro: "Nuevo"
  try {
    await page.waitForSelector('span.ui-search-filter-name', { timeout: 60000 });
    const spans = await page.$$('span.ui-search-filter-name');
  
    for (const span of spans) {
      const text = await (await span.getProperty('textContent')).jsonValue();
      if (text.trim() === 'Nuevo') {
        await span.click();
        break;
      }
    }
    await page.screenshot({ path: 'Filtrar_Nuevo.png' });
  } catch (error) {
    console.error('Error al aplicar filtro de condición:', error);
    await page.screenshot({ path: 'error_filtro_condicion.png' });
    await browser.close();
    return;
  }
  
  // Filtro: Ubicación "Ciudad de México"
  try {
    await page.waitForSelector('span.ui-search-filter-name', { timeout: 60000 });
    const spans = await page.$$('span.ui-search-filter-name');
  
    for (const span of spans) {
      const text = await (await span.getProperty('textContent')).jsonValue();
      if (text.trim().includes('Distrito Federal')) {
        await span.click();
        break;
      }
    }
    await page.screenshot({ path: 'Filtra_CDMX.png' });
  } catch (error) {
    console.error('Error al aplicar filtro de ubicación:', error);
    await page.screenshot({ path: 'error_filtro_ubicacion.png' });
    await browser.close();
    return;
  }
  
  //Order Mayor Precio
  try {
   
  const dropdownSelector = 'button.andes-dropdown__trigger';
  await page.waitForSelector(dropdownSelector, { timeout: 60000, visible: true });

  
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView();
    }
  }, dropdownSelector);

  
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.click();
    }
  }, dropdownSelector);


  await page.waitForSelector('.andes-floating-menu', { timeout: 60000 });

  console.log('✅ Ordenado por mayor precio correctamente.');


  } catch (error) {
    console.error('❌ Error al ordenar por precio:', error.message);
  
    
    try {
      if (!page.isClosed()) {
        await page.screenshot({ path: 'error_ordenar_precio.png' });
      }
    } catch (screenshotError) {
      console.error('⚠️ No se pudo capturar el screenshot:', screenshotError.message);
    }
  
    
    try {
      const pages = await browser.pages();
      if (pages.length > 0) {
        await browser.close();
      }
    } catch (closeError) {
      console.error('⚠️ No se pudo cerrar el navegador:', closeError.message);
    }
  }
  
  
  try {
    await page.waitForSelector('.ui-search-result__wrapper', { timeout: 60000 });

    const products = await page.$$eval('.ui-search-result__wrapper', nodes => {
      return nodes.slice(0, 5).map(node => {
        const title = node.querySelector('h3')?.innerText || 'Título no disponible';
        const price = node.querySelector('.poly-component__price')?.innerText || 'Precio no disponible';
        return { title, price };
      });
    });
  
    await page.screenshot({ path: 'Cinco_Primeros.png' });

    console.log('\n=== Primeros 5 Productos ===');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price}`);
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    await page.screenshot({ path: 'error_obtener_productos.png'});
  }
  
  //Cerrar navegador
  //await browser.close();
})();