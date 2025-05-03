import axios from 'axios';
import { envs } from 'src/config';

export const handleGetDollarPrice = async () => {
  const response = await axios.get(`https://api.currencyapi.com/v3/latest?apikey=${envs.dollarApiKey}`);
  return Number(response?.data?.data?.COP?.value?.toFixed(2))
}

//export default { handleGetDollarPrice }