import { useState } from "react";
import API from "../services/api";

function CreateAuction() {

  const [auction, setAuction] = useState({
    title: "",
    description: "",
    starting_price: "",
    end_time: ""
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const createAuction = async () => {

    try {

      const token =
        localStorage.getItem("token");
      const formData = new FormData();

      Object.entries(auction).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (image) {
        formData.append("image", image);
      }

      await API.post(
        "/auctions",
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
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
      <div className="page-heading">
        <div>
          <h1 className="page-title">Create Auction</h1>
          <p className="page-subtitle">
            Add an item, set a starting price, and choose when bidding closes.
          </p>
        </div>
      </div>

      <section className="form-panel">
        <label className="form-label">Product Image</label>

        <input
          className="form-control mb-3"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            setImage(selectedFile || null);
            setPreviewUrl(
              selectedFile ? URL.createObjectURL(selectedFile) : ""
            );
          }}
        />

        {previewUrl && (
          <img
            className="auction-image-preview mb-3"
            src={previewUrl}
            alt="Auction preview"
          />
        )}

        <label className="form-label">Title</label>

      <input
        className="form-control mb-3"
        placeholder="Title"
        onChange={(e) =>
          setAuction({
            ...auction,
            title: e.target.value
          })
        }
      />

        <label className="form-label">Description</label>

      <input
        className="form-control mb-3"
        placeholder="Description"
        onChange={(e) =>
          setAuction({
            ...auction,
            description: e.target.value
          })
        }
      />

        <label className="form-label">Starting Price</label>

      <input
        className="form-control mb-3"
        type="number"
        placeholder="Starting Price"
        onChange={(e) =>
          setAuction({
            ...auction,
            starting_price: e.target.value
          })
        }
      />

        <label className="form-label">End Time</label>

      <input
        className="form-control mb-4"
        type="datetime-local"
        onChange={(e) =>
          setAuction({
            ...auction,
            end_time: e.target.value
          })
        }
      />

      <button
        className="btn btn-primary"
        type="button"
        onClick={createAuction}
      >
        Create Auction
      </button>
      </section>

    </div>
  );
}

export default CreateAuction;
