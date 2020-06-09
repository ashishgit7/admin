var checkBoxID = [];

async function showUsers(){

	document.getElementById('users_btn').style.backgroundColor = 'white';
	document.getElementById('request_btn').style.backgroundColor = 'rgba(0,0,0,0.2)';

	var arrID = [];
	await firebase.firestore().collection('userProfile').get().then(res =>{

		res.forEach((element) => {
			arrID.push(element.id)
		});
	});

	arrID.forEach( async function(element) {

		var checked = ""
		var reg;
		await firebase.firestore().collection('registeredUser').doc(element).get().then(response => {

			if(response.data().registered)
				checked = "checked";
			else
				checked = "";


			if(checked)
				reg = 'Registered';
			else 
				reg = 'Unregistered';

		}).catch(err =>{
			checked = "";
			if(checked)
				reg = 'Registered';
			else 
				reg = 'Unregistered';
		})


		await firebase.firestore().collection('userProfile').doc(element).get().then(res =>{
			var img,flag = false;

			if(res.data().personal === undefined){
				if((/@/).test(element)){
					img = "https://img.favpng.com/21/13/5/user-profile-default-computer-icons-network-video-recorder-png-favpng-7dPZA8WRdY80Uw3bdMWkEN4fR.jpg";
				}
				else{
					img = res.data().image;
				}
			}
			else{
				if((/@/).test(element)){
					flag = true;
					firebase.storage().ref("userImage/"+element).getDownloadURL().then(url =>{
						img =  url;
						newElement(img,res,checked,reg,element);
					});
				}else{
					img = res.data().image;
				}
			}




			if(!flag){
				checkBoxID.push(element);

				var newEle = `

				<div style="box-shadow: 1px 5px 5px rgba(0,0,0,0.5);height:80px;width:100%;margin:20px auto;background-color: white;border-right: 10px;position: relative;">
				<img src="${img}"  style="margin:0;vertical-align: middle;height: 50%;margin-top:17px;margin-left: 30px;" alt="">
				<h4 style="position:absolute;top:35%;left:30%;">${res.data().name}</h4>
				<h5 style="position:absolute;top:35%;left:50%;">${res.data().email}</h5>

				<label style="margin-top:28px;margin-left:30px;position: absolute;" class="switch">
				<input type="checkbox" id="${element}" ${checked}>
				<span class="slider"></span>
				</label>
				<h6 id="${element+'Reg'}" style="position:absolute;margin-top:-25px;margin-left:160px;">${reg}</h6>

				<i id="${element+'rent'}" style="position:absolute;top:50%;right:5%;transform: translate(0,-50%);" class="fa fa-chevron-right next" aria-hidden="true"></i>
				</div>


				`


				document.getElementById('userList').innerHTML += newEle; 
			}
		})
	});




}

function newElement(img,res,checked,reg,element) {

	checkBoxID.push(element);
	var newEle = `

	<div style="box-shadow: 1px 5px 5px rgba(0,0,0,0.5);height:80px;width:100%;margin:20px auto;background-color: white;border-right: 10px;position: relative;">
	<img src="${img}"  style="margin:0;vertical-align: middle;height: 50%;margin-top:17px;margin-left: 30px;" alt="">
	<h4 style="position:absolute;top:35%;left:30%;">${res.data().name}</h4>
	<h5 style="position:absolute;top:35%;left:50%;">${res.data().email}</h5>

	<label style="margin-top:28px;margin-left:30px;position: absolute;" class="switch">
	<input type="checkbox" id="${element}"  ${checked}>
	<span class="slider"></span>
	</label>
	<h6 id="${element+'Reg'}" style="position:absolute;margin-top:-25px;margin-left:160px;">${reg}</h6>

	<i id="${element+'rent'}" style="position:absolute;top:50%;right:5%;transform: translate(0,-50%);" class="fa fa-chevron-right next" aria-hidden="true"></i>
	</div>


	`
	document.getElementById('userList').innerHTML += newEle;
}



var clickedBox;

window.onclick = function(e){
	if(e.target == modal){
		modal.style.display = "none";
		document.getElementById(clickedBox).checked = false;
	}

	if(e.target.id === 'close_modal'){
		document.getElementById(clickedBox).checked = false;
	}


	if(checkBoxID.indexOf(e.target.id)!==-1)
	{
		if(document.getElementById(e.target.id).checked){
			clickedBox = e.target.id ;
			document.getElementById('modal-btn').click();
			console.log('now checked');

		}
		else{
			clickedBox = e.target.id ;

			firebase.firestore().collection('registeredUser').doc(clickedBox).delete().then( ()=>{
				console.log('Deleted')
				document.getElementById(clickedBox+'Reg').textContent ="Unregistered";
			})

			console.log('now unchecked')

		}
	}

	if(e.target.id === 'submit_user'){
		var myFirebaseFirestoreTimestampFromDate = firebase.firestore.Timestamp.fromDate(new Date());

		firebase.firestore().collection('registeredUser').doc(clickedBox).set(
		{ 
			ownerId: document.getElementById('ownerId').value,
			propertyId: document.getElementById('propId').value,
			registered: true,
			seconds: myFirebaseFirestoreTimestampFromDate.seconds

		},
		{
			merge: true
		})

		setTimeout(function(){
			modal.style.display = "none";
			document.getElementById(clickedBox).checked = true;
			document.getElementById(clickedBox+'Reg').textContent ="Registered";

			clickedBox = null;
		},800)
	}

	if(e.target.classList[2] === 'next'){

		document.getElementById('paidData').innerHTML = ""

			document.getElementById('amountfill').innerHTML = `
			<input style="padding-left: 5px;" id="amountPaid" type="text" placeholder="Enter Amount">
			<br><br>
              <select id="paymedium" >
                <option value="cash">Cash</option>
                <option value="online">Digital</option>
              </select>
              <br><br>
             <button type="" onclick="payRent()" class="btn btn-danger">Submit</button></td>

		`

		clickedBox = e.target.id.toString().substring(0,e.target.id.length - 4);

		document.getElementById('rent_div').style.display = 'block';
		document.getElementById('userDiv').style.display= 'none';
		document.getElementById('back_btn').style.display = 'block';
		var rentArr = [];
		var arrMonth = ['JAN','FEB' ,'MAR' ,'APR' , 'MAY' , 'JUN' , 'JUL' , 'AUG', 'SEP' , 'OCT' , 'NOV' , 'DEC'];
		var temp = 0;
		firebase.firestore().collection('rentPaid').doc(e.target.id.toString().substring(0,e.target.id.length - 4)).get().then(res =>{
			(res.data().paid).forEach( (ele) => {

				var x = {
							sec: ele.date.seconds, //second of timestamp
							amount: ele.amount,
							total: ele.total,
							vn: ele.vn,
							date: ele.date.toDate().toString().substring(0,10),
							month:  ele.month
						}
						rentArr.push(x);

					});

			rentArr.sort(function(a,b){ return Number(b.sec) - Number(a.sec)});
			rentArr.forEach((element, index) => {

				if(element.date.charAt(9)=='1')
					element.date += "st";
				else if(element.date.charAt(9)=='2')
					element.date += "nd";
				else if(element.date.charAt(9)=='3')
					element.date += "rd";
				else
					element.date += "th";

				var newEle =`
				<div style="width:95%;height:105px;background-color:white;border-radius:0px;border:1px solid #ddd;box-shadow:0px 2px 5px rgba(0,0,0,0.6);margin:12px auto;position:relative;">
				<div style="border-left: 2px solid rgb(219, 219, 219);height:53px;position:absolute;top:50%;margin-left:30px;transform:translate(0%,-50%)"></div>

				<span style="color:black; font-size:13px; width:100%; height:24px; background:rgb(211, 211, 211); display:block;box-shadow:0px 2px 2px rgba(0,0,0,0.7);"><span style="margin-left:12px;font-family:Montserrat;font-weight:600;font-size:15px;">Invoice No.: </span><span style="color:#3fb6c6;font-family:Montserrat;font-weight:600;font-size:15px;">${element.vn}</span></span> 
				<h6 style="margin-left:40px;margin-top:14px;font-family:Montserrat;font-weight:700"><i class="fa fa-circle-o" aria-hidden="true" style="position:absolute;margin-left:-16px;color:#3fb6c6;background-color:white;"></i>Rent ${element.month} <span style="float:right;margin-right:10px;"> ₹ ${element.amount}</span></h6>
				<p style="margin-top:-7px;margin-left:40px;font-size:13px;position:relative;"><span style="font-family:Montserrat;"> Paid on ${element.date}</span></p>
				<hr style="margin-top:-13px;margin-bottom:0;">
				<p style="margin-left:15px;font-family:Montserrat;font-weight:600;font-size:15px;">Total: ₹ ${element.total}<span style="float:right;margin-right:10px;">VIEW INVOICE</span></p>
				</div>
				`
				temp++;
				document.getElementById('paidData').innerHTML += newEle;
				if(temp==1)
					document.getElementById('payRent').textContent = arrMonth[arrMonth.indexOf(element.month)] + " Rent Paid";
				
				
			});

		});

		
	}






}

function fillAmount(){
	document.getElementById('amountfill').style.display = 'block';
	document.getElementById('payRent').disabled = true;
}

function payRent(){
	var myFirebaseFirestoreTimestampFromDate = firebase.firestore.Timestamp.fromDate(new Date());

	firebase.firestore().collection('rentPaid').doc(clickedBox).get().then(res =>{
		if(res.exists)
		{
			firebase.firestore().collection('rentPaid').doc(clickedBox).update({
				paid:firebase.firestore.FieldValue.arrayUnion({
					amount:document.getElementById('amountPaid').value,
					total:document.getElementById('amountPaid').value,
					vn:"RLLVNSO"+ Math.floor(Math.random()*10000000).toString(),
					date: firebase.firestore.Timestamp.fromDate(new Date()),
					mode: document.getElementById('paymedium').value,
					month: myFirebaseFirestoreTimestampFromDate.toDate().toString().substring(4,7).toUpperCase()

				})
			})
			console.log('Done')

		}else{
			firebase.firestore().collection('rentPaid').doc(this.uid).set({

				paid:firebase.firestore.FieldValue.arrayUnion({
					amount:document.getElementById('amountPaid').value,
					total:document.getElementById('amountPaid').value,
					vn:"RLLVNSO"+ Math.floor(Math.random()*10000000).toString(),
					date: firebase.firestore.Timestamp.fromDate(new Date()),
					mode:document.getElementById('paymedium').value,
					month: myFirebaseFirestoreTimestampFromDate.toDate().toString().substring(4,7).toUpperCase()
				})
			})

			console.log('Done')
		}

		document.getElementById('amountfill').innerHTML = `
			<input style="padding-left: 5px;" id="amountPaid" type="text" placeholder="Enter Amount">
			<br><br>
              <select id="paymedium" >
                <option value="cash">Cash</option>
                <option value="online">Digital</option>
              </select>
              <br><br>
             <h5>DONE!</h5></td>

		`
	})
}


function showRequests(){
	document.getElementById('request_btn').style.backgroundColor = 'white';
	document.getElementById('users_btn').style.backgroundColor = 'rgba(0,0,0,0.2)';



}

let modalBtn = document.getElementById("modal-btn")
let modal = document.querySelector(".modal")
let closeBtn = document.querySelector(".close-btn")
modalBtn.onclick = function(){
	modal.style.display = "block"
}
closeBtn.onclick = function(){
	modal.style.display = "none"
}


// get all owners id
firebase.firestore().collection('ownerProfile').get().then( res =>{
	res.forEach( function(docs) {
		var newEle = `
		<option value="${docs.id}">${docs.id}</option>
		`
		document.getElementById('ownerId').innerHTML += newEle;
	});
})

// geyt all properties id
firebase.firestore().collection('properties').get().then( res =>{
	res.forEach( function(docs) {
		var newEle = `
		<option value="${docs.id}">${docs.id}</option>
		`
		document.getElementById('propId').innerHTML += newEle;
	});
})

