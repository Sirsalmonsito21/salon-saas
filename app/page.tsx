import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: salones } = await supabase.from('salones').select('*')

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Salones registrados</h1>
      {salones?.map((salon) => (
        <div key={salon.id} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
          <h2>{salon.nombre}</h2>
          <p>{salon.email}</p>
          <p>Plan: {salon.plan}</p>
        </div>
      ))}
    </main>
  )
}