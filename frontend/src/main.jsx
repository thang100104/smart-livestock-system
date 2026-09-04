import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const API='http://localhost:8000/api';

const menu=[
  ['dashboard','⌂','Tổng quan'],
  ['animals','🐖','Vật nuôi'],
  ['barns','🏠','Chuồng trại'],
  ['care','🩺','Chăm sóc'],
  ['vacc','💉','Tiêm phòng'],
  ['growth','📈','Tăng trưởng'],
  ['feeds','🌾','Thức ăn'],
  ['exports','🚚','Xuất bán'],
  ['ai','✦','Trợ lý AI'],
  ['reports','📊','Báo cáo']
];

function App(){
  const [token,setToken]=useState(localStorage.getItem('token'));
  const [user,setUser]=useState(
    JSON.parse(localStorage.getItem('user')||'null')
  );

  const [tab,setTab]=useState('dashboard');
  const [data,setData]=useState({});
  const [msg,setMsg]=useState('');

  const call=async(path,opts={})=>{
    const r=await fetch(API+path,{
      ...opts,
      headers:{
        'Content-Type':'application/json',
        Authorization:token?`Bearer ${token}`:'',
        ...(opts.headers||{})
      }
    });

    const b=await r.json().catch(()=>({}));

    if(!r.ok){
      throw Error(b.detail||'Có lỗi xảy ra');
    }

    return b;
  };

  const load=async()=>{
    if(!token) return;

    try{
      const [
        dash,
        animals,
        barns,
        care,
        vacc,
        growth,
        feeds,
        exports,
        ai
      ]=await Promise.all([
        call('/dashboard'),
        call('/animals?limit=100'),
        call('/barns'),
        call('/care'),
        call('/vaccinations'),
        call('/growth'),
        call('/feed-types'),
        call('/exports'),
        call('/ai/history')
      ]);

      setData({
        dash,
        animals:animals.data,
        barns,
        care,
        vacc,
        growth,
        feeds,
        exports,
        ai
      });

      setMsg('Dữ liệu đã cập nhật');

      setTimeout(()=>setMsg(''),2500);

    }catch(e){
      setMsg(e.message);
    }
  };

  useEffect(()=>{
    load();
  },[token]);

  if(!token){
    return (
      <Login
        onLogin={(t,u)=>{
          localStorage.setItem('token',t);
          localStorage.setItem('user',JSON.stringify(u));
          setToken(t);
          setUser(u);
        }}
      />
    );
  }

  const logout=()=>{
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  const current=menu.find(x=>x[0]===tab);

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">
          <div className="brandmark">🐖</div>

          <div>
            <b>Smart Livestock</b>
            <span>AI Management</span>
          </div>
        </div>

        <div className="profile">
          <div className="avatar">
            {(user?.name||'A').slice(0,1).toUpperCase()}
          </div>

          <div>
            <b>{user?.name||'Người dùng'}</b>
            <small>{user?.role||'user'}</small>
          </div>
        </div>

        <nav>
          {menu.map(([k,ic,v])=>(
            <button
              key={k}
              className={tab===k?'navactive':''}
              onClick={()=>setTab(k)}
            >
              <i>{ic}</i>
              <span>{v}</span>
              {k==='ai'&&<em>AI</em>}
            </button>
          ))}
        </nav>

        <button className="logout" onClick={logout}>
          ↪ Đăng xuất
        </button>

      </aside>

      <main>

        <header className="topbar">

          <div>
            <div className="eyebrow">
              HỆ THỐNG QUẢN LÝ CHĂN NUÔI
            </div>

            <h1>{current?.[2]}</h1>
          </div>

          <div className="top-actions">

            <span className="status-dot">
              ● Hệ thống hoạt động
            </span>

            <button className="refresh" onClick={load}>
              ↻
            </button>

          </div>

        </header>

        {msg&&(
          <div className="toast">
            ✓ {msg}
          </div>
        )}

        {tab==='dashboard'&&
          <Dashboard
            d={data.dash}
            animals={data.animals||[]}
            setTab={setTab}
          />
        }

        {tab==='animals'&&
          <Animals
            rows={data.animals||[]}
            reload={load}
            call={call}
            user={user}
          />
        }

        {tab==='barns'&&
          <Barns rows={data.barns||[]}/>
        }

        {tab==='care'&&
  <Care
    rows={data.care||[]}
    animals={data.animals||[]}
    reload={load}
    call={call}
    user={user}
  />
}

{tab==='vacc'&&
  <Vacc
    rows={data.vacc||[]}
    animals={data.animals||[]}
    reload={load}
    call={call}
    user={user}
  />
}

{tab==='growth'&&
  <Growth
    rows={data.growth||[]}
    animals={data.animals||[]}
    reload={load}
    call={call}
    user={user}
  />
}

        {tab==='feeds'&&
          <Feeds rows={data.feeds||[]}/>
        }

        {tab==='exports'&&
          <Exports rows={data.exports||[]}/>
        }

        {tab==='ai'&&
          <AI
            rows={data.ai||[]}
            call={call}
            reload={load}
          />
        }

        {tab==='reports'&&
          <Reports call={call}/>
        }

      </main>

    </div>
  );
}


/* =========================
   LOGIN
========================= */

function Login({onLogin}){

  const [u,setU]=useState('admin');
  const [p,setP]=useState('admin123');
  const [err,setErr]=useState('');

  const go=async e=>{

    e.preventDefault();

    try{

      const r=await fetch(API+'/auth/login',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          username:u,
          password:p
        })
      });

      const b=await r.json();

      if(!r.ok){
        throw Error(b.detail);
      }

      onLogin(b.access_token,b.user);

    }catch(e){
      setErr(e.message);
    }
  };

  return (

    <div className="login">

      <div className="login-art">

        <div className="sun">✦</div>

        <div className="pig">🐖</div>

        <h2>
          Quản lý chăn nuôi
          <br/>
          <span>thông minh hơn với AI</span>
        </h2>

        <p>
          Theo dõi đàn, chăm sóc, tăng trưởng
          và báo cáo trên một nền tảng.
        </p>

      </div>

      <form className="login-card" onSubmit={go}>

        <div className="mini-brand">
          🐖 <b>Smart Livestock</b>
        </div>

        <h1>Chào mừng trở lại</h1>

        <p>
          Đăng nhập để quản lý trang trại
        </p>

        <label>Tài khoản</label>

        <input
          value={u}
          onChange={e=>setU(e.target.value)}
          placeholder="Nhập tài khoản"
        />

        <label>Mật khẩu</label>

        <input
          value={p}
          onChange={e=>setP(e.target.value)}
          type="password"
          placeholder="Nhập mật khẩu"
        />

        <button>
          Đăng nhập <span>→</span>
        </button>

        {err&&
          <b className="error">
            {err}
          </b>
        }

        <small>
          Demo: admin / admin123
        </small>

      </form>

    </div>
  );
}


/* =========================
   DASHBOARD
========================= */

function Dashboard({d,animals,setTab}){

  const health=useMemo(()=>({

    normal:animals.filter(
      x=>x.health==='binh_thuong'
    ).length,

    watch:animals.filter(
      x=>x.health==='can_theo_doi'
    ).length,

    sick:animals.filter(
      x=>x.health==='benh'
    ).length

  }),[animals]);

  return (

    <>

      <div className="hero">

        <div>

          <span className="pill">
            ● LIVE FARM DATA
          </span>

          <h2>
            Xin chào! 👋
          </h2>

          <p>
            Đây là bức tranh tổng quan
            về trang trại của bạn hôm nay.
          </p>

        </div>

        <div className="hero-icon">
          🌱
        </div>

      </div>


      <div className="stats">

        <Stat
          icon="🐖"
          label="Tổng đàn"
          value={d?.total_animals??0}
          note="con"
        />

        <Stat
          icon="🏠"
          label="Chuồng trại"
          value={d?.total_barns??0}
          note={`${d?.occupied_barns??0} đang nuôi`}
        />

        <Stat
          icon="♥"
          label="Cần theo dõi"
          value={d?.sick_animals??0}
          note="trường hợp"
          alert
        />

        <Stat
          icon="₫"
          label="Doanh thu"
          value={`${(d?.revenue??0).toLocaleString()} đ`}
          note="tổng xuất bán"
        />

      </div>


      <div className="dashboard-grid">

        <section className="panel">

          <div className="panel-head">

            <div>
              <h3>Tình trạng sức khỏe</h3>
              <p>Phân bổ đàn hiện tại</p>
            </div>

            <span>Hôm nay</span>

          </div>

          <div className="health">

            <div className="health-ring">

              <strong>{animals.length}</strong>

              <small>
                tổng con
              </small>

            </div>

            <div className="legend">

              <Legend
                dot="normal"
                text="Bình thường"
                val={health.normal}
              />

              <Legend
                dot="watch"
                text="Cần theo dõi"
                val={health.watch}
              />

              <Legend
                dot="sick"
                text="Bệnh"
                val={health.sick}
              />

            </div>

          </div>

        </section>


        <section className="panel quick">

          <div className="panel-head">

            <div>
              <h3>Truy cập nhanh</h3>
              <p>Thao tác thường dùng</p>
            </div>

          </div>


          <div className="quick-grid">

            <Quick
              icon="🐖"
              title="Quản lý vật nuôi"
              sub="Thêm / sửa / xóa"
              onClick={()=>setTab('animals')}
            />

            <Quick
              icon="💉"
              title="Lịch vaccine"
              sub="Kiểm tra lịch tiêm"
              onClick={()=>setTab('vacc')}
            />

            <Quick
              icon="🤖"
              title="Hỏi AI"
              sub="Phân tích dữ liệu"
              onClick={()=>setTab('ai')}
            />

            <Quick
              icon="📊"
              title="Báo cáo"
              sub="Xem thống kê"
              onClick={()=>setTab('reports')}
            />

          </div>

        </section>

      </div>

    </>
  );
}


function Stat({icon,label,value,note,alert}){

  return (

    <div className="stat">

      <div className={'stat-icon '+(alert?'danger':'')}>
        {icon}
      </div>

      <div>

        <span>{label}</span>

        <strong>{value}</strong>

        <small>{note}</small>

      </div>

    </div>

  );
}


function Legend({dot,text,val}){

  return (

    <div>

      <i className={dot}></i>

      <span>{text}</span>

      <b>{val}</b>

    </div>

  );
}


function Quick({icon,title,sub,onClick}){

  return (

    <button
      className="quick-item"
      onClick={onClick}
      type="button"
    >

      <div>{icon}</div>

      <span>

        <b>{title}</b>

        <small>{sub}</small>

      </span>

      <b>→</b>

    </button>

  );
}


/* =========================
   TABLE
========================= */

function Table({cols,rows}) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c[0]}>
                {c[1]}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows && rows.length > 0 ? (
            rows.map((r, i) => (
              <tr key={r.id ?? i}>
                {cols.map((c) => {
                  const value = r[c[0]];

                  return (
                    <td key={c[0]}>
                      {c[0] === 'health' ? (
                        <Health v={value} />
                      ) : c[0] === 'status' ? (
                        <Badge v={value} />
                      ) : (
                        String(value ?? '')
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="empty"
                colSpan={cols.length}
              >
                Chưa có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


function Health({v}){

  const m={
    binh_thuong:['Bình thường','ok'],
    can_theo_doi:['Theo dõi','warn'],
    benh:['Bệnh','bad']
  };

  const x=m[v]||[v,''];

  return (
    <span className={'tag '+x[1]}>
      {x[0]}
    </span>
  );
}


function Badge({v}){

  return (
    <span className="tag">
      {String(v||'').replaceAll('_',' ')}
    </span>
  );
}


/* =========================
   VẬT NUÔI
   THÊM / SỬA / XÓA
========================= */

function Animals({rows, reload, call, user}) {
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

  // FORM THÊM / SỬA
  const [form, setForm] = useState({
    code: '',
    species: 'Heo',
    origin: '',
    weight: 0,
    health: 'binh_thuong',
    status: 'dang_nuoi',
    barn_id: ''
  });

  // FORM BÁN
  const [showSell, setShowSell] = useState(false);
  const [sellAnimal, setSellAnimal] = useState(null);

  const [sellForm, setSellForm] = useState({
    quantity: 1,
    weight: '',
    price: '',
    customer: ''
  });

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setForm({
      code: '',
      species: 'Heo',
      origin: '',
      weight: 0,
      health: 'binh_thuong',
      status: 'dang_nuoi',
      barn_id: ''
    });

    setEditId(null);
    setShow(false);
  };

  // =========================
  // THÊM / SỬA
  // =========================
  const save = async () => {
    if (!form.code.trim()) {
      alert('Vui lòng nhập mã vật nuôi');
      return;
    }

    if (Number(form.weight) < 0) {
      alert('Khối lượng không được âm');
      return;
    }

    try {
      const body = {
        code: form.code.trim(),
        species: form.species,
        origin: form.origin.trim(),
        weight: Number(form.weight),
        health: form.health,
        status: form.status,
        barn_id: form.barn_id
          ? Number(form.barn_id)
          : null
      };

      if (editId) {
        await call(`/animals/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });

        alert('✅ Đã sửa vật nuôi');
      } else {
        await call('/animals', {
          method: 'POST',
          body: JSON.stringify(body)
        });

        alert('✅ Đã thêm vật nuôi');
      }

      resetForm();
      await reload();

    } catch (e) {
      alert('❌ ' + e.message);
    }
  };

  // =========================
  // MỞ FORM SỬA
  // =========================
  const edit = (r) => {
    setForm({
      code: r.code || '',
      species: r.species || 'Heo',
      origin: r.origin || '',
      weight: r.weight || 0,
      health: r.health || 'binh_thuong',
      status: r.status || 'dang_nuoi',
      barn_id: r.barn_id || ''
    });

    setEditId(r.id);
    setShow(true);
  };

  // =========================
  // XÓA
  // =========================
  const remove = async (id) => {
    if (user?.role !== 'Admin') {
      alert('⚠️ Chỉ Admin mới được xóa vật nuôi');
      return;
    }

    if (!window.confirm(
      'Bạn có chắc muốn xóa vật nuôi này?'
    )) {
      return;
    }

    try {
      await call(`/animals/${id}`, {
        method: 'DELETE'
      });

      alert('✅ Đã xóa vật nuôi');
      await reload();

    } catch (e) {
      alert('❌ ' + e.message);
    }
  };

  // =========================
  // MỞ FORM BÁN
  // =========================
  const openSell = (animal) => {

    if (animal.status !== 'dang_nuoi') {
      alert('⚠️ Vật nuôi này đã xuất bán hoặc không còn trong đàn');
      return;
    }

    setSellAnimal(animal);

    setSellForm({
      quantity: 1,
      weight: animal.weight || '',
      price: '',
      customer: ''
    });

    setShowSell(true);
  };

  // =========================
  // XÁC NHẬN BÁN
  // =========================
  const sell = async () => {

    if (!sellAnimal) {
      alert('Không tìm thấy vật nuôi');
      return;
    }

    if (!sellForm.quantity || Number(sellForm.quantity) <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    if (!sellForm.weight || Number(sellForm.weight) <= 0) {
      alert('Vui lòng nhập khối lượng');
      return;
    }

    if (!sellForm.price || Number(sellForm.price) <= 0) {
      alert('Vui lòng nhập đơn giá');
      return;
    }

    const total =
      Number(sellForm.weight) *
      Number(sellForm.price);

    try {

      await call('/exports', {
        method: 'POST',
        body: JSON.stringify({
          animal_id: sellAnimal.id,
          quantity: Number(sellForm.quantity),
          weight: Number(sellForm.weight),
          total: total,
          customer: sellForm.customer.trim()
        })
      });

      alert(
        `✅ Xuất bán thành công!\n\n` +
        `Vật nuôi: ${sellAnimal.code}\n` +
        `Tổng tiền: ${total.toLocaleString('vi-VN')} đ`
      );

      setShowSell(false);
      setSellAnimal(null);

      setSellForm({
        quantity: 1,
        weight: '',
        price: '',
        customer: ''
      });

      await reload();

    } catch (e) {
      alert('❌ ' + e.message);
    }
  };

  // =========================
  // TỔNG TIỀN
  // =========================
  const sellTotal =
    Number(sellForm.weight || 0) *
    Number(sellForm.price || 0);

  return (
    <div>

      {/* =========================
          TIÊU ĐỀ
      ========================= */}
      <div className="section-intro">

        <div>
          <h2>🐖 Quản lý vật nuôi</h2>

          <p>
            Quản lý danh sách vật nuôi trong trang trại.
          </p>
        </div>

        <button
          className="add-button"
          onClick={() => {
            setEditId(null);

            setForm({
              code: '',
              species: 'Heo',
              origin: '',
              weight: 0,
              health: 'binh_thuong',
              status: 'dang_nuoi',
              barn_id: ''
            });

            setShow(true);
          }}
        >
          ＋ Thêm mới
        </button>

      </div>


      {/* =========================
          FORM THÊM / SỬA
      ========================= */}
      {show && (

        <div className="form-card">

          <h3>
            {editId
              ? '✏️ Sửa thông tin vật nuôi'
              : '➕ Thêm vật nuôi mới'}
          </h3>

          <input
            placeholder="Mã vật nuôi"
            value={form.code}
            onChange={(e) =>
              setForm({
                ...form,
                code: e.target.value
              })
            }
          />

          <input
            placeholder="Loài"
            value={form.species}
            onChange={(e) =>
              setForm({
                ...form,
                species: e.target.value
              })
            }
          />

          <input
            placeholder="Nguồn gốc"
            value={form.origin}
            onChange={(e) =>
              setForm({
                ...form,
                origin: e.target.value
              })
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Khối lượng (kg)"
            value={form.weight}
            onChange={(e) =>
              setForm({
                ...form,
                weight: e.target.value
              })
            }
          />

          <select
            value={form.health}
            onChange={(e) =>
              setForm({
                ...form,
                health: e.target.value
              })
            }
          >
            <option value="binh_thuong">
              Bình thường
            </option>

            <option value="can_theo_doi">
              Cần theo dõi
            </option>

            <option value="benh">
              Bệnh
            </option>
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value
              })
            }
          >
            <option value="dang_nuoi">
              Đang nuôi
            </option>

            <option value="da_xuat_ban">
              Đã xuất bán
            </option>
          </select>

          <input
            type="number"
            min="1"
            placeholder="ID chuồng"
            value={form.barn_id}
            onChange={(e) =>
              setForm({
                ...form,
                barn_id: e.target.value
              })
            }
          />

          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '10px'
            }}
          >

            <button
              className="save-button"
              onClick={save}
            >
              💾 Lưu
            </button>

            <button
              className="cancel-button"
              onClick={resetForm}
            >
              Hủy
            </button>

          </div>

        </div>
      )}


      {/* =========================
          FORM BÁN
      ========================= */}
      {showSell && sellAnimal && (

        <div className="form-card">

          <h3>
            💰 Xuất bán vật nuôi
          </h3>

          <div
            style={{
              background: '#f4f7fb',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '15px'
            }}
          >

            <strong>
              Vật nuôi: {sellAnimal.code}
            </strong>

            <br />

            Loài: {sellAnimal.species}

            <br />

            Khối lượng hiện tại:
            {' '}
            {sellAnimal.weight} kg

          </div>


          <label>Số lượng</label>

          <input
            type="number"
            min="1"
            value={sellForm.quantity}
            onChange={(e) =>
              setSellForm({
                ...sellForm,
                quantity: e.target.value
              })
            }
          />


          <label>Khối lượng bán (kg)</label>

          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Ví dụ: 85"
            value={sellForm.weight}
            onChange={(e) =>
              setSellForm({
                ...sellForm,
                weight: e.target.value
              })
            }
          />


          <label>Đơn giá (đ/kg)</label>

          <input
            type="number"
            min="0"
            placeholder="Ví dụ: 65000"
            value={sellForm.price}
            onChange={(e) =>
              setSellForm({
                ...sellForm,
                price: e.target.value
              })
            }
          />


          <label>Khách hàng</label>

          <input
            placeholder="Tên khách hàng"
            value={sellForm.customer}
            onChange={(e) =>
              setSellForm({
                ...sellForm,
                customer: e.target.value
              })
            }
          />


          {/* TỔNG TIỀN */}
          <div
            style={{
              marginTop: '15px',
              padding: '15px',
              borderRadius: '12px',
              background: '#eaf8f1',
              fontSize: '18px',
              fontWeight: '700'
            }}
          >

            💵 Tổng tiền:

            {' '}

            {sellTotal.toLocaleString('vi-VN')} đ

          </div>


          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '15px'
            }}
          >

            <button
              className="save-button"
              onClick={sell}
            >
              💰 Xác nhận bán
            </button>

            <button
              className="cancel-button"
              onClick={() => {
                setShowSell(false);
                setSellAnimal(null);
              }}
            >
              Hủy
            </button>

          </div>

        </div>
      )}


      {/* =========================
          DANH SÁCH VẬT NUÔI
      ========================= */}
      <div className="tablewrap">

        <table>

          <thead>

            <tr>

              <th>ID</th>
              <th>Mã</th>
              <th>Loài</th>
              <th>Nguồn gốc</th>
              <th>Khối lượng</th>
              <th>Sức khỏe</th>
              <th>Trạng thái</th>
              <th>Chuồng</th>
              <th>Thao tác</th>

            </tr>

          </thead>


          <tbody>

            {rows.length > 0 ? (

              rows.map((r) => (

                <tr key={r.id}>

                  <td>{r.id}</td>

                  <td>
                    <b>{r.code}</b>
                  </td>

                  <td>
                    {r.species}
                  </td>

                  <td>
                    {r.origin || '-'}
                  </td>

                  <td>
                    {r.weight} kg
                  </td>

                  <td>
                    <Health v={r.health} />
                  </td>

                  <td>
                    <Badge v={r.status} />
                  </td>

                  <td>
                    {r.barn_id || '-'}
                  </td>

                  <td>

                    <button
                      className="edit-button"
                      onClick={() => edit(r)}
                    >
                      ✏️ Sửa
                    </button>


                    {user?.role === 'Admin' && (

                      <button
                        className="delete-button"
                        onClick={() => remove(r.id)}
                      >
                        🗑️ Xóa
                      </button>

                    )}


                    {r.status === 'dang_nuoi' && (

                      <button
                        className="save-button"
                        style={{
                          marginLeft: '6px'
                        }}
                        onClick={() => openSell(r)}
                      >
                        💰 Bán
                      </button>

                    )}

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="9"
                  className="empty"
                >
                  Chưa có dữ liệu vật nuôi
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
/* =========================
   CÁC MODULE QUẢN LÝ
========================= */

function Simple({title, sub, rows, cols}) {
  return (
    <>
      <div className="section-intro">
        <div>
          <h2>{title}</h2>
          <p>{sub}</p>
        </div>

        <span className="count">
          {rows?.length || 0} bản ghi
        </span>
      </div>

      <Table
        cols={cols}
        rows={rows || []}
      />
    </>
  );
}


/* =========================
   CHUỒNG TRẠI
========================= */

function Barns({rows, reload, call, user}) {
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    capacity: 20,
    status: 'dang_nuoi'
  });

  const resetForm = () => {
    setForm({
      name: '',
      capacity: 20,
      status: 'dang_nuoi'
    });

    setEditId(null);
    setShow(false);
  };

  const openAdd = () => {
    setEditId(null);

    setForm({
      name: '',
      capacity: 20,
      status: 'dang_nuoi'
    });

    setShow(true);
  };

  const edit = (r) => {
    setEditId(r.id);

    setForm({
      name: r.name || '',
      capacity: r.capacity || 20,
      status: r.status || 'dang_nuoi'
    });

    setShow(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên chuồng');
      return;
    }

    if (Number(form.capacity) <= 0) {
      alert('Sức chứa phải lớn hơn 0');
      return;
    }

    try {
      const body = {
        name: form.name,
        capacity: Number(form.capacity),
        status: form.status
      };

      if (editId) {
        await call(`/barns/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });

        alert('✅ Đã sửa chuồng trại');
      } else {
        await call('/barns', {
          method: 'POST',
          body: JSON.stringify(body)
        });

        alert('✅ Đã thêm chuồng trại');
      }

      resetForm();
      await reload();

    } catch (e) {
      alert('❌ ' + e.message);
    }
  };

  const remove = async (id) => {
    if (user?.role !== 'Admin') {
      alert('⚠️ Chỉ Admin mới được xóa chuồng trại');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa chuồng trại này?')) {
      return;
    }

    try {
      await call(`/barns/${id}`, {
        method: 'DELETE'
      });

      alert('✅ Đã xóa chuồng trại');

      await reload();

    } catch (e) {
      alert('❌ ' + e.message);
    }
  };

  return (
    <div>

      <div className="section-intro">

        <div>
          <h2>🏠 Chuồng trại</h2>
          <p>
            Quản lý danh sách chuồng, sức chứa và trạng thái.
          </p>
        </div>

        <button
          className="add-button"
          onClick={openAdd}
        >
          ＋ Thêm mới
        </button>

      </div>


      {show && (
        <div className="form-card">

          <h3>
            {editId
              ? '✏️ Sửa chuồng trại'
              : '➕ Thêm chuồng trại'}
          </h3>

          <div className="form-grid">

            <div>
              <label>Tên chuồng</label>

              <input
                type="text"
                placeholder="Ví dụ: Chuồng 6"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value
                  })
                }
              />
            </div>


            <div>
              <label>Sức chứa</label>

              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacity: e.target.value
                  })
                }
              />
            </div>


            <div>
              <label>Trạng thái</label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value
                  })
                }
              >
                <option value="dang_nuoi">
                  Đang nuôi
                </option>

                <option value="trong">
                  Trống
                </option>

                <option value="bao_tri">
                  Bảo trì
                </option>
              </select>

            </div>

          </div>


          <div className="form-actions">

            <button
              className="save-button"
              onClick={save}
            >
              💾 Lưu
            </button>

            <button
              className="cancel-button"
              onClick={resetForm}
            >
              Hủy
            </button>

          </div>

        </div>
      )}


      <div className="tablewrap">

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>TÊN CHUỒNG</th>
              <th>SỨC CHỨA</th>
              <th>SỐ CON</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>

          </thead>


          <tbody>

            {rows && rows.length > 0 ? (

              rows.map((r) => (

                <tr key={r.id}>

                  <td>{r.id}</td>

                  <td>
                    <strong>
                      {r.name}
                    </strong>
                  </td>

                  <td>
                    {r.capacity}
                  </td>

                  <td>
                    {r.animal_count ?? 0}
                  </td>

                  <td>
                    <Badge v={r.status} />
                  </td>

                  <td>

                    <button
                      className="edit-button"
                      onClick={() => edit(r)}
                    >
                      ✏️ Sửa
                    </button>


                    {user?.role === 'Admin' && (

                      <button
                        className="delete-button"
                        onClick={() => remove(r.id)}
                      >
                        🗑️ Xóa
                      </button>

                    )}

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="empty"
                >
                  Chưa có dữ liệu chuồng trại
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

/* =========================
   CHĂM SÓC
========================= */

function Care({rows, animals, reload, call, user}) {

  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    animal_id: '',
    action: '',
    note: ''
  });

  const save = async () => {

    if (!form.animal_id) {
      alert('Vui lòng chọn vật nuôi');
      return;
    }

    if (!form.action.trim()) {
      alert('Vui lòng nhập hoạt động chăm sóc');
      return;
    }

    try {

      await call('/care', {
        method: 'POST',
        body: JSON.stringify({
          animal_id: Number(form.animal_id),
          action: form.action.trim(),
          note: form.note.trim()
        })
      });

      alert('✅ Đã thêm nhật ký chăm sóc');

      setForm({
        animal_id: '',
        action: '',
        note: ''
      });

      setShow(false);

      await reload();

    } catch (e) {

      alert('❌ ' + e.message);

    }

  };


  const remove = async (id) => {

    if (user?.role !== 'Admin') {

      alert('⚠️ Chỉ Admin mới được xóa nhật ký');

      return;

    }

    if (!window.confirm(
      'Bạn có chắc muốn xóa nhật ký chăm sóc này?'
    )) {

      return;

    }

    try {

      await call(`/care/${id}`, {
        method: 'DELETE'
      });

      alert('✅ Đã xóa nhật ký');

      await reload();

    } catch (e) {

      alert('❌ ' + e.message);

    }

  };


  return (

    <>

      <div className="section-intro">

        <div>

          <h2>🩺 Nhật ký chăm sóc</h2>

          <p>
            Lịch sử hoạt động chăm sóc đàn.
          </p>

        </div>


        <button
          className="add-button"
          onClick={() => setShow(true)}
        >
          ＋ Thêm mới
        </button>

      </div>


      {show && (

        <div className="form-card">

          <h3>
            ➕ Thêm nhật ký chăm sóc
          </h3>


          <div className="form-grid">

            <div>

              <label>Vật nuôi</label>

              <select
                value={form.animal_id}
                onChange={e =>
                  setForm({
                    ...form,
                    animal_id: e.target.value
                  })
                }
              >

                <option value="">
                  -- Chọn vật nuôi --
                </option>

                {animals.map(a => (

                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.code} - {a.species}
                  </option>

                ))}

              </select>

            </div>


            <div>

              <label>
                Hoạt động chăm sóc
              </label>

              <input
                value={form.action}
                onChange={e =>
                  setForm({
                    ...form,
                    action: e.target.value
                  })
                }
                placeholder="Ví dụ: Cho ăn, vệ sinh..."
              />

            </div>


            <div>

              <label>Ghi chú</label>

              <input
                value={form.note}
                onChange={e =>
                  setForm({
                    ...form,
                    note: e.target.value
                  })
                }
                placeholder="Nhập ghi chú"
              />

            </div>

          </div>


          <div className="form-actions">

            <button
              className="save-button"
              onClick={save}
            >
              💾 Lưu
            </button>

            <button
              className="cancel-button"
              onClick={() => setShow(false)}
            >
              Hủy
            </button>

          </div>

        </div>

      )}


      <div className="tablewrap">

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>VẬT NUÔI</th>

              <th>HOẠT ĐỘNG</th>

              <th>GHI CHÚ</th>

              <th>THỜI GIAN</th>

              <th>THAO TÁC</th>

            </tr>

          </thead>


          <tbody>

            {rows?.length ? (

              rows.map(r => (

                <tr key={r.id}>

                  <td>{r.id}</td>

                  <td>{r.animal_id}</td>

                  <td>{r.action}</td>

                  <td>{r.note || '—'}</td>

                  <td>
                    {String(
                      r.created_at || ''
                    )
                    .replace('T', ' ')
                    .slice(0, 19)}
                  </td>

                  <td>

                    {user?.role === 'Admin' && (

                      <button
                        className="delete-button"
                        onClick={() =>
                          remove(r.id)
                        }
                      >
                        🗑️ Xóa
                      </button>

                    )}

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="empty"
                >
                  Chưa có dữ liệu
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </>

  );

}


/* =========================
   TIÊM PHÒNG
========================= */

function Vacc({rows, animals, reload, call, user}) {

  const [show, setShow] = useState(false);

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    animal_id: '',
    vaccine: '',
    scheduled_at: '',
    status: 'chua_tiem',
    note: ''
  });


  const reset = () => {

    setEditId(null);

    setShow(false);

    setForm({
      animal_id: '',
      vaccine: '',
      scheduled_at: '',
      status: 'chua_tiem',
      note: ''
    });

  };


  const edit = (r) => {

    setEditId(r.id);

    setShow(true);

    setForm({
      animal_id: r.animal_id || '',
      vaccine: r.vaccine || '',
      scheduled_at: r.scheduled_at
        ? String(r.scheduled_at).slice(0, 16)
        : '',
      status: r.status || 'chua_tiem',
      note: r.note || ''
    });

  };


  const save = async () => {

    if (!form.animal_id) {

      alert('Vui lòng chọn vật nuôi');

      return;

    }

    if (!form.vaccine.trim()) {

      alert('Vui lòng nhập tên vaccine');

      return;

    }

    if (!form.scheduled_at) {

      alert('Vui lòng chọn lịch tiêm');

      return;

    }


    try {

      const body = {

        animal_id: Number(form.animal_id),

        vaccine: form.vaccine.trim(),

        scheduled_at: form.scheduled_at,

        status: form.status,

        note: form.note.trim()

      };


      if (editId) {

        await call(
          `/vaccinations/${editId}`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );

        alert('✅ Đã cập nhật lịch tiêm');

      } else {

        await call(
          '/vaccinations',
          {
            method: 'POST',
            body: JSON.stringify(body)
          }
        );

        alert('✅ Đã thêm lịch tiêm');

      }


      reset();

      await reload();

    } catch (e) {

      alert('❌ ' + e.message);

    }

  };


  const remove = async (id) => {

    if (user?.role !== 'Admin') {

      alert('⚠️ Chỉ Admin mới được xóa lịch tiêm');

      return;

    }


    if (!window.confirm(
      'Bạn có chắc muốn xóa lịch tiêm này?'
    )) {

      return;

    }


    try {

      await call(
        `/vaccinations/${id}`,
        {
          method: 'DELETE'
        }
      );

      alert('✅ Đã xóa lịch tiêm');

      await reload();

    } catch (e) {

      alert('❌ ' + e.message);

    }

  };


  return (

    <>

      <div className="section-intro">

        <div>

          <h2>💉 Tiêm phòng</h2>

          <p>
            Quản lý lịch tiêm vaccine.
          </p>

        </div>


        <button
          className="add-button"
          onClick={() => {

            setEditId(null);

            setForm({
              animal_id: '',
              vaccine: '',
              scheduled_at: '',
              status: 'chua_tiem',
              note: ''
            });

            setShow(true);

          }}
        >
          ＋ Thêm mới
        </button>

      </div>


      {show && (

        <div className="form-card">

          <h3>
            {editId
              ? '✏️ Sửa lịch tiêm'
              : '➕ Thêm lịch tiêm'}
          </h3>


          <div className="form-grid">

            <div>

              <label>Vật nuôi</label>

              <select
                value={form.animal_id}
                onChange={e =>
                  setForm({
                    ...form,
                    animal_id: e.target.value
                  })
                }
              >

                <option value="">
                  -- Chọn vật nuôi --
                </option>

                {animals.map(a => (

                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.code} - {a.species}
                  </option>

                ))}

              </select>

            </div>


            <div>

              <label>Vaccine</label>

              <input
                value={form.vaccine}
                onChange={e =>
                  setForm({
                    ...form,
                    vaccine: e.target.value
                  })
                }
                placeholder="Tên vaccine"
              />

            </div>


            <div>

              <label>Lịch tiêm</label>

              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={e =>
                  setForm({
                    ...form,
                    scheduled_at: e.target.value
                  })
                }
              />

            </div>


            <div>

              <label>Trạng thái</label>

              <select
                value={form.status}
                onChange={e =>
                  setForm({
                    ...form,
                    status: e.target.value
                  })
                }
              >

                <option value="chua_tiem">
                  Chưa tiêm
                </option>

                <option value="da_tiem">
                  Đã tiêm
                </option>

                <option value="bo_qua">
                  Bỏ qua
                </option>

              </select>

            </div>


            <div>

              <label>Ghi chú</label>

              <input
                value={form.note}
                onChange={e =>
                  setForm({
                    ...form,
                    note: e.target.value
                  })
                }
                placeholder="Ghi chú"
              />

            </div>

          </div>


          <div className="form-actions">

            <button
              className="save-button"
              onClick={save}
            >
              💾 Lưu
            </button>

            <button
              className="cancel-button"
              onClick={reset}
            >
              Hủy
            </button>

          </div>

        </div>

      )}


      <div className="tablewrap">

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>VẬT NUÔI</th>

              <th>VACCINE</th>

              <th>LỊCH TIÊM</th>

              <th>TRẠNG THÁI</th>

              <th>GHI CHÚ</th>

              <th>THAO TÁC</th>

            </tr>

          </thead>


          <tbody>

            {rows?.length ? (

              rows.map(r => (

                <tr key={r.id}>

                  <td>{r.id}</td>

                  <td>{r.animal_id}</td>

                  <td>{r.vaccine}</td>

                  <td>
                    {String(
                      r.scheduled_at || ''
                    )
                    .replace('T', ' ')
                    .slice(0, 16)}
                  </td>

                  <td>
                    <Badge v={r.status}/>
                  </td>

                  <td>{r.note || '—'}</td>

                  <td>

                    <button
                      className="edit-button"
                      onClick={() => edit(r)}
                    >
                      ✏️ Sửa
                    </button>


                    {user?.role === 'Admin' && (

                      <button
                        className="delete-button"
                        onClick={() =>
                          remove(r.id)
                        }
                      >
                        🗑️ Xóa
                      </button>

                    )}

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="7"
                  className="empty"
                >
                  Chưa có dữ liệu
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </>

  );

}

/* =========================
   TĂNG TRƯỞNG
========================= */

function Growth({rows, animals, reload, call, user}) {

  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    animal_id: '',
    measured_at: '',
    weight: '',
    note: ''
  });


  const save = async () => {

    if (!form.animal_id) {

      alert('Vui lòng chọn vật nuôi');

      return;

    }

    if (!form.weight) {

      alert('Vui lòng nhập khối lượng');

      return;

    }

    if (Number(form.weight) < 0) {

      alert('Khối lượng không được âm');

      return;

    }


    try {

      await call('/growth', {

        method: 'POST',

        body: JSON.stringify({

          animal_id: Number(form.animal_id),

          measured_at:
            form.measured_at ||
            new Date().toISOString(),

          weight: Number(form.weight),

          note: form.note.trim()

        })

      });


      alert(
        '✅ Đã thêm dữ liệu tăng trưởng'
      );


      setForm({
        animal_id: '',
        measured_at: '',
        weight: '',
        note: ''
      });

      setShow(false);

      await reload();

    } catch (e) {

      alert('❌ ' + e.message);

    }

  };


  const remove = async (id) => {

    if (user?.role !== 'Admin') {

      alert(
        '⚠️ Chỉ Admin mới được xóa dữ liệu'
      );

      return;

    }


    if (!window.confirm(
      'Bạn có chắc muốn xóa dữ liệu này?'
    )) {

      return;

    }


    try {

      await call(
        `/growth/${id}`,
        {
          method: 'DELETE'
        }
      );

      alert(
        '✅ Đã xóa dữ liệu tăng trưởng'
      );

      await reload();

    } catch (e) {

      alert('❌ ' + e.message);

    }

  };


  return (

    <>

      <div className="section-intro">

        <div>

          <h2>📈 Tăng trưởng</h2>

          <p>
            Theo dõi khối lượng và quá trình phát triển.
          </p>

        </div>


        <button
          className="add-button"
          onClick={() => setShow(true)}
        >
          ＋ Thêm mới
        </button>

      </div>


      {show && (

        <div className="form-card">

          <h3>
            ➕ Thêm dữ liệu tăng trưởng
          </h3>


          <div className="form-grid">

            <div>

              <label>Vật nuôi</label>

              <select
                value={form.animal_id}
                onChange={e =>
                  setForm({
                    ...form,
                    animal_id: e.target.value
                  })
                }
              >

                <option value="">
                  -- Chọn vật nuôi --
                </option>

                {animals.map(a => (

                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.code} - {a.species}
                  </option>

                ))}

              </select>

            </div>


            <div>

              <label>Ngày đo</label>

              <input
                type="datetime-local"
                value={form.measured_at}
                onChange={e =>
                  setForm({
                    ...form,
                    measured_at: e.target.value
                  })
                }
              />

            </div>


            <div>

              <label>
                Khối lượng (kg)
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={e =>
                  setForm({
                    ...form,
                    weight: e.target.value
                  })
                }
                placeholder="Ví dụ: 25.5"
              />

            </div>


            <div>

              <label>Ghi chú</label>

              <input
                value={form.note}
                onChange={e =>
                  setForm({
                    ...form,
                    note: e.target.value
                  })
                }
                placeholder="Ghi chú"
              />

            </div>

          </div>


          <div className="form-actions">

            <button
              className="save-button"
              onClick={save}
            >
              💾 Lưu
            </button>

            <button
              className="cancel-button"
              onClick={() => setShow(false)}
            >
              Hủy
            </button>

          </div>

        </div>

      )}


      <div className="tablewrap">

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>VẬT NUÔI</th>

              <th>NGÀY ĐO</th>

              <th>KHỐI LƯỢNG</th>

              <th>GHI CHÚ</th>

              <th>THAO TÁC</th>

            </tr>

          </thead>


          <tbody>

            {rows?.length ? (

              rows.map(r => (

                <tr key={r.id}>

                  <td>{r.id}</td>

                  <td>{r.animal_id}</td>

                  <td>
                    {String(
                      r.measured_at || ''
                    )
                    .replace('T', ' ')
                    .slice(0, 16)}
                  </td>

                  <td>
                    <strong>
                      {r.weight} kg
                    </strong>
                  </td>

                  <td>
                    {r.note || '—'}
                  </td>

                  <td>

                    {user?.role === 'Admin' && (

                      <button
                        className="delete-button"
                        onClick={() =>
                          remove(r.id)
                        }
                      >
                        🗑️ Xóa
                      </button>

                    )}

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="empty"
                >
                  Chưa có dữ liệu
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </>

  );

}


/* =========================
   THỨC ĂN
========================= */

function Feeds({rows}) {
  return (
    <Simple
      title="🌾 Thức ăn"
      sub="Quản lý kho thức ăn và thông tin định mức."
      rows={rows}
      cols={[
        ['id','ID'],
        ['name','Tên thức ăn'],
        ['unit','Đơn vị'],
        ['stock','Tồn kho'],
        ['description','Mô tả']
      ]}
    />
  );
}


/* =========================
   XUẤT BÁN
========================= */

function Exports({rows}) {
  return (
    <Simple
      title="🚚 Xuất bán"
      sub="Theo dõi các phiếu xuất bán và doanh thu."
      rows={rows}
      cols={[
        ['id','ID'],
        ['animal_id','Vật nuôi'],
        ['quantity','Số lượng'],
        ['weight','Kg'],
        ['total','Tổng tiền'],
        ['customer','Khách hàng'],
        ['exported_at','Ngày xuất']
      ]}
    />
  );
}


/* =========================
   AI
========================= */

function AI({rows,call,reload}){

  const [
    p,
    setP
  ]=useState(
    'Hãy phân tích tình trạng đàn và đề xuất chăm sóc.'
  );

  const [ans,setAns]=useState('');
  const [mode,setMode]=useState('');
  const [busy,setBusy]=useState(false);


  const go=async()=>{

    if(!p.trim()) return;

    setBusy(true);

    try{

      const r=await call(
        '/ai/analyze',
        {
          method:'POST',
          body:JSON.stringify({
            prompt:p
          })
        }
      );

      setAns(r.answer);
      setMode(r.mode);

      reload();

    }catch(e){

      alert(e.message);

    }finally{

      setBusy(false);

    }

  };


  return (

    <div className="ai-page">

      <div className="ai-hero">

        <div className="ai-orb">
          ✦
        </div>

        <div>

          <span className="pill purple">
            AI ASSISTANT
          </span>

          <h2>
            Trợ lý chăn nuôi thông minh
          </h2>

          <p>
            Hỏi về đàn vật nuôi, chăm sóc,
            tăng trưởng, vaccine hoặc báo cáo.
          </p>

        </div>

      </div>


      <div className="chat-card">

        <div className="chat-title">

          <div className="ai-avatar">
            ✦
          </div>

          <div>

            <b>Smart Livestock AI</b>

            <small>
              Phân tích dữ liệu trang trại
            </small>

          </div>

          <span className="online">
            ● Online
          </span>

        </div>


        <div className="suggestions">

          <button
            onClick={()=>
              setP(
                'Tổng hợp tình hình đàn hiện tại và những điểm cần chú ý.'
              )
            }
          >
            📋 Tổng hợp đàn
          </button>

          <button
            onClick={()=>
              setP(
                'Những vật nuôi nào cần được theo dõi sức khỏe?'
              )
            }
          >
            ♥ Sức khỏe
          </button>

          <button
            onClick={()=>
              setP(
                'Đề xuất cách theo dõi tăng trưởng của đàn.'
              )
            }
          >
            📈 Tăng trưởng
          </button>

          <button
            onClick={()=>
              setP(
                'Tôi nên kiểm tra lịch vaccine như thế nào?'
              )
            }
          >
            💉 Vaccine
          </button>

        </div>


        <textarea
          value={p}
          onChange={e=>setP(e.target.value)}
          placeholder="Nhập câu hỏi cho AI..."
        />


        <button
          className="ask"
          disabled={busy}
          onClick={go}
        >
          {busy?
            'Đang phân tích…':
            'Gửi cho AI  →'
          }
        </button>


        {ans&&(

          <div className="ai-answer">

            <div className="answer-head">

              <b>✦ AI trả lời</b>

              <span>
                {mode==='openai'?
                  'OpenAI':
                  'AI dự phòng'
                }
              </span>

            </div>

            <div>
              {ans}
            </div>

          </div>

        )}

      </div>


      <div className="section-intro">

        <div>

          <h2>
            Lịch sử hội thoại
          </h2>

          <p>
            Các yêu cầu AI đã được lưu trong hệ thống.
          </p>

        </div>

      </div>


      <Table
        cols={[
          ['id','ID'],
          ['request','Yêu cầu'],
          ['response','Kết quả'],
          ['mode','Mode'],
          ['created_at','Thời gian']
        ]}
        rows={rows}
      />

    </div>

  );

}


/* =========================
   REPORTS
========================= */

function Reports({call}){

  const [x,setX]=useState(null);


  const load=async path=>{

    try{

      setX(await call(path));

    }catch(e){

      alert(e.message);

    }

  };


  return (

    <>

      <div className="section-intro">

        <div>

          <h2>
            Báo cáo & thống kê
          </h2>

          <p>
            Chọn loại báo cáo để xem dữ liệu tổng hợp.
          </p>

        </div>

      </div>


      <div className="report-buttons">

        <button
          onClick={()=>
            load('/reports/health')
          }
        >
          ♥ Sức khỏe
        </button>

        <button
          onClick={()=>
            load('/reports/growth')
          }
        >
          📈 Tăng trưởng
        </button>

        <button
          onClick={()=>
            load('/reports/sales')
          }
        >
          ₫ Xuất bán
        </button>

      </div>


      <pre className="report-output">

        {x?
          JSON.stringify(x,null,2):
          'Chọn một báo cáo ở trên để xem kết quả.'
        }

      </pre>

    </>

  );

}


createRoot(
  document.getElementById('root')
).render(
  <App/>
);