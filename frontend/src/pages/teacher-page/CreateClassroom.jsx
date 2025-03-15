import React, { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";

const sampleBanners = [
  "https://png.pngtree.com/thumb_back/fh260/background/20240513/pngtree-sky-blue-banner-background-vector-image_15729383.jpg",
  "https://bbdniit.ac.in/wp-content/uploads/2020/09/banner-background-without-image-min.jpg",
  "https://img.lovepik.com/background/20211022/large/lovepik-taobao-tmall-e-commerce-banner-background-image_500603827.jpg",
  "https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_1280.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOOJd8E_F4GEZIrHXpmSasDTnnJUNGTZUuuEnji7AyYko0cL7oCvesyW8LAae1deNn0JQ&usqp=CAU",
  "https://png.pngtree.com/thumb_back/fh260/background/20241217/pngtree-blue-and-white-banner-background-vector-image_16821023.jpg",
  "https://t4.ftcdn.net/jpg/05/54/46/89/360_F_554468927_iwU3VYIjsaeopAb0WPYxVf21TloEhTEj.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl3jsFATFO55L1ktHzCAB68DCQ63Pgdu7z1qzVUWeczmA5YjFkN0ZnN2IpyF1tStWA-oc&usqp=CAU",
  "https://t4.ftcdn.net/jpg/02/54/80/85/360_F_254808568_fj6iuMwwzloSZYKbhDPShWzSK6GeEjXj.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTotxQFSrLnmuh8Lz3sVVBsz9cnCx8-F79diIlvhU60HHwqpoWJiini7iA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh2ZESjMbTJGWyg79VPoUPJXrK2o4uE7_KQVEqxtIZH4yYnT9tbUjIfKQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyUvp_m0e4LiP8r3-saXnb857qG8l_MT-u9GBdx-wncLLQ0bYcpVagpyw&s",
  
];


const CreateClassroomPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bannerUrl: "",
  });
  const [preview, setPreview] = useState(null);
  const { idToken } = useAuthStore();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSampleSelect = (image) => {
    setFormData({ ...formData, bannerUrl: image });
    setPreview(image);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        bannerUrl: formData.bannerUrl,
      };

      await axiosInstance.post("/c/create-classroom", data, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      
      setFormData({ name: "", description: "", bannerUrl: "" });
      setPreview(null);
      navigate(-1);
      toast.success("New classroom created successfully");
    } catch (error) {
      toast.error("Error creating classroom");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Create Classroom</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Classroom Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Classroom Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        <div>
          <p className="text-lg font-semibold mb-2">Select a Banner</p>
          <div className="grid grid-cols-4 gap-2">
            {sampleBanners.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Sample ${index + 1}`}
                className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${preview === image ? "border-blue-500" : "border-gray-300"}`}
                onClick={() => handleSampleSelect(image)}
              />
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-lg font-semibold mb-2">Or Enter Image URL</p>
          <input
            type="url"
            placeholder="Paste image URL from Google"
            value={formData.bannerUrl}
            onChange={(e) => {
              setFormData({ ...formData, bannerUrl: e.target.value });
              setPreview(e.target.value);
            }}
            className="w-full p-2 border rounded"
          />
        </div>
        {preview && (
          <img
            src={preview}
            alt="Banner Preview"
            className="w-full h-40 object-cover mt-2 rounded"
          />
        )}
        <button
          type="submit"
          className="w-full bg-gradient-to-b from-[#af47e8] to-[#7a1cbf] text-white p-3 rounded hover:bg-blue-600"
        >
          Create Classroom
        </button>
      </form>
    </div>
  );
};

export default CreateClassroomPage;
