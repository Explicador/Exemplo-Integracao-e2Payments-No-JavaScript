document.getElementById("mpesaBtn").addEventListener("click", function() {
    
    handlePaymentUsing('Mpesa');

});

document.getElementById("emolaBtn").addEventListener("click", function() {
    
  handlePaymentUsing('eMola');

});

/**
 * Processa pagamentos Mpesa ou eMola
 * 
 * @param {String} paymentOption - tipo de pagamento 'Mpesa' ou 'eMola'. Caso nenhum valor seja enviado, por padrão será feita transação via Mpesa
 * @returns true/false
 * 
 */
async function handlePaymentUsing(paymentOption = 'Mpesa') {

  console.log('handlePaymentUsing() start...');

  const credentials = {
      grant_type: 'client_credentials',
      client_id: '982f6250-41e1-4b64-b645-769b18367d8d	',
      client_secret: '',
      emola_wallet_id: null, //eMola Production e2Payments	
      mpesa_wallet_id: null, //Carteira de Testes da Live	
  }

  const tokenCredentials = { 
    grant_type: credentials.grant_type, 
    client_id: credentials.client_id,
    client_secret: credentials.client_secret
  }

  // Passo 1 - Requisição do token
  let token = await axios.post('https://e2payments.explicador.co.mz/oauth/token', tokenCredentials)
  .then(response => {

      // O server retornou o token
      // Isso quer dizer que o client_id e client_secret estão correctos
      // Guarde o token num ficheiro localmente. E leia a partir de ficheiro para diminuir o tempo de espera
      return response.data.token_type + ' ' + response.data.access_token;
  }).catch(error => {

      // O server retornou um erro
      // Nenhum token foi retornado
      console.log('Server error #52: ', error.response.data);

      return false
  });


  if (!token) {
      // Se nenhum token tiver sido retornado interrompemos a execução do código que segue
      return false;
  }

  // Passo 2 - Composição do payload para realização da transação
  // O 'phone', 'amount' podem vir do formulário
  // O 'reference' deve ser diferente em cada requisição
  const formData = {
      client_id: credentials.client_id,
      sms_reference: 'JogoB1234', //A ser mostrada na SMS de confirmação de pagamento (Mpesa/eMola)
      phone: null, //trocar ao testar com eMola, iniciar com 86/87
      amount: 2,
      reference: 'PROe2Payments321', // A ser mostrada no POPUP na inserção do PIN (Mpesa/eMola), sem espaços e sem acentos, máximo 32 caracteres, apenas letras e numeros
      fromApp: null, // Se a opção senha de apps estiver activa
  }

  const headers = {
      headers: {
          'Authorization': token,
          'Content-Type' : 'application/json',
          'Accept': 'application/json'
      }
  }

  const ENDPOINT = (paymentOption === 'Mpesa') 
  ? 'https://e2payments.explicador.co.mz/v1/c2b/mpesa-payment/' + credentials.mpesa_wallet_id 
  : 'https://e2payments.explicador.co.mz/v1/c2b/emola-payment/' + credentials.emola_wallet_id;

  axios.post(
      ENDPOINT,
      formData,
      headers
  ).then(response => {

      if (response.status === 200) {
        // Pagamento realizado com sucesso
        // Pode gravar na base de dados, e mais...
        console.log('handlePaymentUsing() end with success...', response);
        return;

      }

      console.log('handlePaymentUsing() end with errors #100...', response);

  }).catch(error => {

  //    console.log('eMola Payment error: ', error)

      alert("Pagamento falhou. Tente novamente ou mais tarde.");

      console.log('handlePaymentUsing() end with errors #108...');
      console.log('Server error #109: ', error.response.data);

  });

}