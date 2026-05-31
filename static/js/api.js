async function get_income(start=null, end=null){
    let url = 'get_income'
    if (start && end){
        url = url + '/' + start + '_' + end
    } 
    income = await fetch_data(url)
    document.getElementById('income_data').innerText = '$' + income.toFixed(2)
    return income
}

async function get_spending(start=null, end=null){
    let url = 'get_spent'
    if (start && end){
        url = url + '/' + start + '_' + end
    } 
    spent = await fetch_data(url)
    document.getElementById('total_spent').innerText = '$' + spent.toFixed(2)
    return spent
}

async function get_invested(start=null, end=null){
    let url = 'investment'
    if (start && end){
        url = url + '/' + start + '_' + end
    } 
    invested = await fetch_data(url)
    document.getElementById('total_invested').innerText = '$' + invested.toFixed(2)
    return invested
}

async function fetch_data(endpoint){
    let url = '/api/' + endpoint
    console.log('Sending request to '+url)
    try {
        const response = await fetch(url)
        const json = await response.json();
        return json
        
    } catch (error){
        console.error(error.message)
    }
}

async function post_data(endpoint, data){
    let url = '/api/' + endpoint
    console.log('Sending request to '+url)
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        const json = await response.json();
        return json
        
    } catch (error){
        console.error(error.message)
    }
}