import { useState } from "react";
import API from "../services/api";

function CreateAuction() {

  const [auction, setAuction] = useState({
    title: "",
    description: "",
    starting_price: "",
    end_time: ""
  });

  const createAuction = async () => {

    try {

      const token =
        localStorage.getItem("token");

      await API.post(
        "/auctions",
        auction,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert("Auction Created");

    } catch (error) {

      alert("Failed to Create Auction");

      console.log(error);

    }
  };

  return (
    <div>

      <h2>Create Auction</h2>

      <input
        placeholder="Title"
        onChange={(e) =>
          setAuction({
            ...auction,
            title: e.target.value
          })
        }
      />

      <br /><br />

      <input
        placeholder="Description"
        onChange={(e) =>
          setAuction({
            ...auction,
            description: e.target.value
          })
        }
      />

      <br /><br />

      <input
        placeholder="Starting Price"
        onChange={(e) =>
          setAuction({
            ...auction,
            starting_price: e.target.value
          })
        }
      />

      <br /><br />

      <input
        type="datetime-local"
        onChange={(e) =>
          setAuction({
            ...auction,
            end_time: e.target.value
          })
        }
      />

      <br /><br />

      <button onClick={createAuction}>
        Create Auction
      </button>

    </div>
  );
}

export default CreateAuction;