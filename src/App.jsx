import React, { useState, useEffect, createContext, useContext } from "react";

const STRIPE_PUBLISHABLE_KEY = "pk_test_REPLACE_ME";
const BACKEND_CREATE_SESSION = "/create-checkout-session";

const DEFAULT_IMAGES = [
  { id: 1, src: "/mnt/data/IMG_3035.jpg", title: "Harbour Blues", tags: ["seascape","moody"], sizes: [
    {type: "Framed", label: '12x16', priceBWP: 500},
    {type: "Framed", label: 'A4', priceBWP: 375},
    {type: "Canvas", label: '50x70', priceBWP: 1250}
  ]},
  { id: 2, src: "/mnt/data/DSC01041.jpg", title: "Forest Shelf", tags: ["macro","wood"], sizes: [
    {type: "Framed", label: '8x8', priceBWP: 350},
    {type: "Framed", label: '4x6', priceBWP: 250},
    {type: "Canvas", label: '42x59.5', priceBWP: 1000}
  ]},
  { id: 3, src: "/mnt/data/DSC01630.jpg", title: "Weaver at Work", tags: ["bird","wildlife"], sizes: [
    {type: "Framed", label: '12x16', priceBWP: 500},
    {type: "Canvas", label: '29.7x42', priceBWP: 750}
  ]}
];

const DEFAULT_RATES = { BWP:1, USD:0.075, ZAR:1.38, EUR:0.069 };

const CartContext = createContext();
function useCart(){ return useContext(CartContext); }

function useLocalState(key, initial){
  const [state, setState] = useState(()=>{
    try{ const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }catch{ return initial; }
  });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(state)); }catch{} },[key,state]);
  return [state, setState];
}

function Logo({ size=48, editable=false, onChange }){
  const [customLogo, setCustomLogo] = useLocalState('av_custom_logo', null);
  useEffect(()=>{ if(onChange) onChange(customLogo); },[customLogo]);
  function handleUpload(e){
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=> setCustomLogo({ name: file.name, data: reader.result });
    reader.readAsDataURL(file);
  }
  return (
    <div className="flex items-center gap-3">
      {customLogo ? (
        <img src={customLogo.data} alt="logo" style={{width:size, height:size, objectFit:'contain'}} className="rounded" />
      ) : (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="rounded-full bg-white p-1 shadow">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="#60c9d6" />
              <stop offset="1" stopColor="#0b6b7a" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" rx="18" fill="url(#g1)" />
          <text x="50%" y="58%" fontSize="36" fontWeight="700" textAnchor="middle" fill="#ffffff">AV</text>
        </svg>
      )}
      <div>
        <div className="text-slate-900 font-bold leading-none text-lg">Ambience Visuals</div>
        <div className="text-sm text-slate-600 -mt-1">Fine Art Photography</div>
      </div>
      {editable && (
        <label className="ml-3 text-xs bg-white/90 text-slate-900 px-2 py-1 rounded cursor-pointer">
          Change logo
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      )}
    </div>
  );
}

function CurrencySelector(){
  const { currency, setCurrency, rates } = useCart();
  const [open,setOpen]=useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(!open)} className="border px-3 py-1 rounded text-sm bg-slate-50">{currency}</button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded shadow w-40 p-2">
          {Object.keys(rates).map(c=> (
            <div key={c} className="flex items-center justify-between py-1">
              <button onClick={()=>{ setCurrency(c); setOpen(false); }} className="text-sm text-slate-700">{c}</button>
              <div className="text-xs text-slate-400">{rates[c]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Header({ setView }){
  const { cart } = useCart();
  return (
    <header className="w-full bg-white shadow sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="cursor-pointer" onClick={()=>setView('home')}>
            <Logo size={56} />
          </div>
          <nav className="hidden md:flex gap-6 items-center text-slate-700">
            <button onClick={()=>setView('gallery')} className="uppercase text-sm tracking-wide">Gallery</button>
            <button onClick={()=>setView('about')} className="uppercase text-sm tracking-wide">About</button>
            <button onClick={()=>setView('contact')} className="uppercase text-sm tracking-wide">Contact</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <CurrencySelector />
          <button onClick={()=>setView('cart')} className="relative text-slate-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l3-8H6.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="20" r="1" fill="currentColor" /><circle cx="18" cy="20" r="1" fill="currentColor" /></svg>
            {cart && cart.length>0 && <span className="absolute -top-2 -right-2 bg-teal-500 text-white rounded-full text-xs px-2">{cart.length}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Home({ setView }){
  const [bg] = useLocalState('av_bg_image', null);
  return (
    <main className="min-h-[70vh] text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col-reverse md:flex-row items-start gap-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">Ambience Visuals</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-xl">Bold, modern photography — clean, gallery-first presentation. Browse large images, choose framed or canvas prints, and securely checkout.</p>
          <div className="mt-6 flex gap-4">
            <button onClick={()=>setView('gallery')} className="px-6 py-3 bg-slate-900 text-white font-semibold rounded">View Gallery</button>
            <button onClick={()=>setView('contact')} className="px-6 py-3 border border-slate-200 rounded text-slate-700">Contact</button>
          </div>
        </div>
        <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow">
          {bg ? (
            <div style={{backgroundImage:`url(${bg.data})`, backgroundSize:'cover', backgroundPosition:'center', height:320}} />
          ) : (
            <img src={DEFAULT_IMAGES[0].src} alt="feature" className="w-full h-80 object-cover" />
          )}
        </div>
      </div>
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl text-slate-800 font-bold mb-4">Favourite shots</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DEFAULT_IMAGES.map(im=> (
            <figure key={im.id} className="rounded overflow-hidden bg-white border">
              <img src={im.src} alt={im.title} className="w-full h-48 object-cover" />
              <figcaption className="p-3 text-slate-700">{im.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}

function Lightbox({ image, onClose }){
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded overflow-hidden">
        <div className="relative">
          <button onClick={onClose} className="absolute right-2 top-2 text-slate-600">Close ✕</button>
          <img src={image.src} alt={image.title} className="w-full h-[70vh] object-contain" />
          <div className="p-4 border-t text-slate-700">{image.title}</div>
        </div>
      </div>
    </div>
  );
}

function Gallery(){
  const [images, setImages] = useLocalState('av_images', DEFAULT_IMAGES);
  const [selected, setSelected] = useState(null);
  const { addToCart, currency, rates } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});

  function priceToCurrency(priceBWP){ const r = rates[currency]||1; return (priceBWP*r).toFixed(2); }

  useEffect(()=>{
    const initial = {};
    images.forEach(im=>{ if(im.sizes && im.sizes.length>0) initial[im.id]=0; });
    setSelectedSizes(prev=> ({...initial, ...prev}));
  },[]);

  function handleSizeChange(imageId, index){
    setSelectedSizes(prev=> ({...prev, [imageId]: index}));
  }

  function handleAddToCart(im){
    const idx = selectedSizes[im.id] || 0;
    const s = im.sizes && im.sizes[idx];
    if(!s) return;
    addToCart({ image: im, variant: `${s.type} ${s.label}`, priceBWP: s.priceBWP });
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 text-slate-800">
      <h2 className="text-3xl font-bold mb-6">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map(im=> (
          <article key={im.id} className="bg-white rounded overflow-hidden border">
            <div className="relative">
              <img src={im.src} alt={im.title} className="w-full h-56 object-cover cursor-pointer" onClick={()=>setSelected(im)} />
              <div className="absolute left-3 bottom-3 bg-white/80 px-3 py-1 rounded text-xs text-slate-700">{Array.isArray(im.tags) ? im.tags.join(' • ') : ''}</div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold">{im.title}</h3>
              <p className="text-sm text-slate-600 mt-2">Available sizes:</p>
              <div className="mt-3 flex flex-col gap-2">
                {Array.isArray(im.sizes) && im.sizes.map((s,idx)=> (
                  <div key={idx} className="flex items-center justify-between text-sm text-slate-700">
                    <div>{s.type} — {s.label}</div>
                    <div>{currency} {priceToCurrency(s.priceBWP)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <select value={selectedSizes[im.id] ?? 0} onChange={(e)=>handleSizeChange(im.id, Number(e.target.value))} className="flex-1 px-3 py-2 border rounded">
                  {Array.isArray(im.sizes) && im.sizes.map((s,idx)=> (<option key={idx} value={idx}>{s.type} {s.label} — {currency} {priceToCurrency(s.priceBWP)}</option>))}
                </select>
                <button onClick={()=>handleAddToCart(im)} className="px-3 py-2 bg-slate-900 text-white rounded">Add to cart</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {selected && <Lightbox image={selected} onClose={()=>setSelected(null)} />}
    </section>
  );
}

function CartView(){
  const { cart, removeFromCart, currency, rates, clearCart } = useCart();
  function conv(priceBWP){ const r = rates[currency]||1; return (priceBWP*r).toFixed(2); }
  const subtotal = cart.reduce((s,it)=> s + (it.priceBWP || 0), 0);

  async function handleCheckout(){
    try{
      const resp = await fetch(BACKEND_CREATE_SESSION, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ items: cart })
      });
      const data = await resp.json();
      if(data.sessionId){
        if(!window.Stripe) return window.alert('Stripe.js not loaded. Add https://js.stripe.com/v3 to index.html.');
        const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        window.alert('Checkout session failed');
      }
    }catch(err){ console.error(err); window.alert('Network error creating session'); }
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-6">Cart</h2>
      {(!cart || cart.length===0) ? (
        <div className="text-slate-600">Your cart is empty.</div>
      ):(
        <div className="bg-white p-4 rounded border">
          {cart.map((it,idx)=> (
            <div key={idx} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <img src={it.image && it.image.src} alt={it.image && it.image.title} className="w-20 h-14 object-cover rounded" />
                <div>
                  <div className="font-semibold text-slate-700">{it.image && it.image.title}</div>
                  <div className="text-sm text-slate-500">{it.variant}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{currency} {conv(it.priceBWP)}</div>
                <button onClick={()=>removeFromCart(idx)} className="text-xs text-slate-400 mt-1">Remove</button>
              </div>
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-slate-600">Subtotal</div>
            <div className="font-bold text-lg">{currency} {(subtotal*(rates[currency]||1)).toFixed(2)}</div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleCheckout} className="px-4 py-2 bg-teal-600 text-white rounded">Checkout with Stripe</button>
            <button onClick={clearCart} className="px-4 py-2 border rounded">Clear cart</button>
          </div>
        </div>
      )}
    </section>
  );
}

function AdminPanel(){
  const [images, setImages] = useLocalState('av_images', DEFAULT_IMAGES);
  const [, setBg] = useLocalState('av_bg_image', null);
  const [, setCustomLogo] = useLocalState('av_custom_logo', null);
  const [title, setTitle] = useLocalState('av_site_title','Ambience Visuals');

  function handleImageUpload(e){
    const file = e.target.files && e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const id = Date.now();
      setImages(prev=> [...prev, { id, src: reader.result, title: file.name, tags: [], sizes: [] }]);
    };
    reader.readAsDataURL(file);
  }

  function handleBgUpload(e){
    const file = e.target.files && e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=> setBg({ name: file.name, data: reader.result });
    reader.readAsDataURL(file);
  }

  function handleLogoUpload(e){
    const file = e.target.files && e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=> setCustomLogo({ name: file.name, data: reader.result });
    reader.readAsDataURL(file);
  }

  function editSizes(id){
    const img = images.find(i=>i.id===id);
    if(!img) return;
    const label = window.prompt('Enter size label (eg 12x16 or 50x70)'); if(!label) return;
    const type = window.prompt('Type (Framed or Canvas)', 'Framed'); if(!type) return;
    const price = window.prompt('Price in BWP', '500'); if(!price) return;
    const s = { type, label, priceBWP: Number(price) };
    setImages(prev=> prev.map(i=> i.id===id ? {...i, sizes: [...(i.sizes||[]), s]} : i));
  }

  function removeImage(id){ if(!window.confirm('Remove image?')) return; setImages(prev=> prev.filter(i=>i.id!==id)); }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-4">Admin panel</h2>
      <div className="bg-white p-4 rounded border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Upload gallery image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Upload background image</label>
            <input type="file" accept="image/*" onChange={handleBgUpload} className="mt-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Upload logo</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="mt-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Site title</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-2 border p-2 rounded w-full" />
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Existing images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map(img=> (
              <div key={img.id} className="border rounded overflow-hidden">
                <img src={img.src} alt={img.title} className="w-full h-36 object-cover" />
                <div className="p-2">
                  <div className="font-semibold">{img.title}</div>
                  <div className="text-sm text-slate-500">Sizes: {(img.sizes||[]).length}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={()=>editSizes(img.id)} className="px-2 py-1 bg-slate-900 text-white rounded text-sm">Add size</button>
                    <button onClick={()=>removeImage(img.id)} className="px-2 py-1 border rounded text-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function About(){
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-4">About Ambience Visuals</h2>
      <p className="text-slate-700 leading-relaxed">Ambience Visuals is a fine art photography studio focused on mood-driven imagery: landscapes, textures, and intimate nature studies. Our prints are crafted for longevity — archival inks, museum-grade papers, and professional framing.</p>
    </section>
  );
}

function Contact(){
  const [form,setForm]=useState({name:'',email:'',message:''});
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-4">Contact</h2>
      <form className="grid gap-4 max-w-xl">
        <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="p-3 border rounded" placeholder="Name" />
        <input value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="p-3 border rounded" placeholder="Email" />
        <textarea value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} className="p-3 border rounded" rows={6} placeholder="Message" />
        <div className="flex gap-3">
          <button type="button" className="px-4 py-2 bg-slate-900 text-white rounded">Send message</button>
          <button type="reset" className="px-4 py-2 border rounded">Reset</button>
        </div>
      </form>
    </section>
  );
}

export default function App(){
  const [view,setView] = useLocalState('av_view','home');
  useLocalState('av_images', DEFAULT_IMAGES);
  const [cart,setCart] = useLocalState('av_cart', []);
  const [currency,setCurrency] = useLocalState('av_currency','BWP');
  const [rates,setRates] = useLocalState('av_rates', DEFAULT_RATES);

  function addToCart(item){ setCart(prev=> [...prev, item]); setView('cart'); }
  function removeFromCart(idx){ setCart(prev=> prev.filter((_,i)=> i!==idx)); }
  function clearCart(){ setCart([]); }

  const ctx = { cart, addToCart, removeFromCart, clearCart, currency, setCurrency, rates, setRates };

  return (
    <CartContext.Provider value={ctx}>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Header setView={setView} />
        <div className="pt-6">
          {view==='home' && <Home setView={setView} />}
          {view==='gallery' && <Gallery />}
          {view==='about' && <About />}
          {view==='contact' && <Contact />}
          {view==='cart' && <CartView />}
          {view==='admin' && <AdminPanel />}
        </div>
        <footer className="mt-12 bg-white py-8 text-slate-600 border-t">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4"><Logo size={36} /><div className="text-sm">© {new Date().getFullYear()} Ambience Visuals</div></div>
            <div className="text-sm">Designed in React — exportable to GitHub.</div>
          </div>
        </footer>
      </div>
    </CartContext.Provider>
  );
}
