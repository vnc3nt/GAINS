window.addEventListener("DOMContentLoaded", (e) => {
    let change_user_name_btn = document.getElementById("changeUsernameBtn");
    let dialog = document.getElementById("change-user-name-dialog");
    
    dialog.querySelector("input[type=reset]").addEventListener("click", (e) => {
        dialog.close();
    })

    dialog.querySelector("input[type=submit]").addEventListener("click", async (e) => {
        e.preventDefault();
        let res = await fetch("/api/check-existance",
            {
                method: "POST",
                body:JSON.stringify({
                    "type": "username",
                    "value": dialog.querySelector("input[name=new_username]").value,
                }),
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-type": "application/json; charset=UTF-8"
                }
            }
        ).then((resp) => resp.json());
        console.log(res);
        if (!res.exists) {
            dialog.querySelector("form").submit();
        }
        else {
            alert("Benutzername existiert bereits");
        }
    })

    change_user_name_btn.addEventListener("click", (e) => {
        dialog.querySelector("input[name=new_username]").value = document.querySelector(".username").innerText.trim();
        dialog.showModal();
    })
})
