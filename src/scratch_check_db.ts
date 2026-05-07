import { createClient } from '@supabase/supabase-api';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
async function test() {
  const { data } = await supabase.from('user_places').select('*').limit(5);
  console.log(JSON.stringify(data, null, 2));
}
test();
