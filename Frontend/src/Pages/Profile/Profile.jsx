
import React from "react";
import "./Profile.css";
import Box from "./Box";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import { Link } from "react-router-dom";
import { FaCoins } from "react-icons/fa";

const Profile = () => {
    const { user, setUser } = useUser();
    const [profileUser, setProfileUser] = useState(null);
    const { username } = useParams();
    const [loading, setLoading] = useState(true);
    const [connectLoading, setConnectLoading] = useState(false);
    const navigate = useNavigate();

    // Backend URL
    const API_URL = "http://localhost:8000";

    useEffect(() => {
        const getUser = async () => {
            setLoading(true);

            try {
                const response = await fetch(
                    `${API_URL}/user/registered/getDetails/${username}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Something went wrong");
                }

                console.log("User Data:", data.data);
                setProfileUser(data.data);

            } catch (error) {
                console.log(error);

                if (error.message) {
                    toast.error(error.message);

                    if (error.message === "Please Login") {
                        localStorage.removeItem("userInfo");
                        setUser(null);

                        try {
                            await fetch(`${API_URL}/auth/logout`, {
                                method: "GET",
                                credentials: "include",
                            });
                        } catch (logoutError) {
                            console.log("Logout error:", logoutError);
                        }

                        navigate("/login");
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, [username, navigate, setUser]);

    const convertDate = (dateTimeString) => {
        const date = new Date(dateTimeString);

        const formattedDate = date
            .toLocaleDateString("en-US", {
                month: "2-digit",
                year: "numeric",
            })
            .replace("/", "-");

        return formattedDate;
    };

    const connectHandler = async () => {
        console.log("Connect");

        try {
            setConnectLoading(true);

            const response = await fetch(
                `${API_URL}/request/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        receiverID: profileUser._id,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            console.log(data);

            toast.success(data.message);

            setProfileUser((prevState) => {
                return {
                    ...prevState,
                    status: "Pending",
                };
            });

        } catch (error) {
            console.log(error);

            if (error.message) {
                toast.error(error.message);

                if (error.message === "Please Login") {
                    localStorage.removeItem("userInfo");
                    setUser(null);

                    try {
                        await fetch(`${API_URL}/auth/logout`, {
                            method: "GET",
                            credentials: "include",
                        });
                    } catch (logoutError) {
                        console.log("Logout error:", logoutError);
                    }

                    navigate("/login");
                }
            }
        } finally {
            setConnectLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div
                className="container"
                style={{ minHeight: "86vh" }}
            >
                {loading ? (
                    <div
                        className="row d-flex justify-content-center align-items-center"
                        style={{ height: "50vh" }}
                    >
                        <Spinner
                            animation="border"
                            variant="primary"
                        />
                    </div>
                ) : (
                    <>
                        <div className="profile-box">
                            <div className="left-div">

                                {/* Profile Photo */}
                                <div className="profile-photo">
                                    <img
                                        src={profileUser?.picture}
                                        alt="Profile"
                                    />
                                </div>

                                {/* Name */}
                                <div className="misc">
                                    <h1
                                        className="profile-name"
                                        style={{ marginLeft: "2rem" }}
                                    >
                                        {profileUser?.name}
                                    </h1>

                                    {/* Rating */}
                                    <div
                                        className="rating"
                                        style={{ marginLeft: "2rem" }}
                                    >
                                        {/* Rating stars */}
                                        <span className="rating-stars">
                                            {profileUser?.rating
                                                ? Array.from(
                                                    {
                                                        length:
                                                            profileUser.rating,
                                                    },
                                                    (_, index) => (
                                                        <span key={index}>
                                                            ⭐
                                                        </span>
                                                    )
                                                )
                                                : "⭐⭐⭐⭐⭐"}
                                        </span>

                                        {/* Rating out of 5 */}
                                        <span className="rating-value">
                                            {profileUser?.rating
                                                ? profileUser?.rating
                                                : "5"}
                                        </span>
                                    </div>

                                    {/* Learning Credits */}
                                    {user?.username === username && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-50 shadow-sm">
                                            <FaCoins className="w-4 h-4 text-amber-600 mx-2" />

                                            <span className="text-sm font-medium text-amber-800">
                                                {profileUser?.learningCredits ??
                                                    0}
                                            </span>

                                            <span className="text-xs text-amber-600 font-normal">
                                                credits
                                            </span>
                                        </div>
                                    )}

                                    {/* Connect and Report Buttons */}
                                    {user?.username !== username && (
                                        <div className="buttons">

                                            {/* Connect */}
                                            <button
                                                className="connect-button"
                                                onClick={
                                                    profileUser?.status ===
                                                    "Connect"
                                                        ? connectHandler
                                                        : undefined
                                                }
                                            >
                                                {connectLoading ? (
                                                    <>
                                                        <Spinner
                                                            animation="border"
                                                            variant="light"
                                                            size="sm"
                                                            style={{
                                                                marginRight:
                                                                    "0.5rem",
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    profileUser?.status
                                                )}
                                            </button>

                                            {/* Report */}
                                            <Link
                                                to={`/report/${profileUser.username}`}
                                            >
                                                <button className="report-button">
                                                    Report
                                                </button>
                                            </Link>

                                            {/* Rate */}
                                            <Link
                                                to={`/rating/${profileUser.username}`}
                                            >
                                                <button className="report-button bg-success">
                                                    Rate
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="edit-links">

                                {/* Edit Profile */}
                                {user?.username === username && (
                                    <Link to="/edit_profile">
                                        <button className="edit-button">
                                            Edit Profile ✎
                                        </button>
                                    </Link>
                                )}

                                {/* Portfolio Links */}
                                <div className="portfolio-links">

                                    {/* Github */}
                                    <a
                                        href={
                                            profileUser?.githubLink
                                                ? profileUser.githubLink
                                                : "#"
                                        }
                                        target={
                                            profileUser?.githubLink
                                                ? "_blank"
                                                : "_self"
                                        }
                                        rel="noopener noreferrer"
                                        referrerPolicy="no-referrer"
                                        className="portfolio-link"
                                    >
                                        <img
                                            src="/assets/images/github.png"
                                            className="link"
                                            alt="Github"
                                        />
                                    </a>

                                    {/* LinkedIn */}
                                    <a
                                        href={
                                            profileUser?.linkedinLink
                                                ? profileUser.linkedinLink
                                                : "#"
                                        }
                                        target={
                                            profileUser?.linkedinLink
                                                ? "_blank"
                                                : "_self"
                                        }
                                        className="portfolio-link"
                                    >
                                        <img
                                            src="/assets/images/linkedin.png"
                                            className="link"
                                            alt="LinkedIn"
                                        />
                                    </a>

                                    {/* Portfolio */}
                                    <a
                                        href={
                                            profileUser?.portfolioLink
                                                ? profileUser.portfolioLink
                                                : "#"
                                        }
                                        target={
                                            profileUser?.portfolioLink
                                                ? "_blank"
                                                : "_self"
                                        }
                                        className="portfolio-link"
                                    >
                                        <img
                                            src="/assets/images/link.png"
                                            className="link"
                                            alt="Portfolio"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <h2>Bio</h2>
                        <p className="bio">
                            {profileUser?.bio}
                        </p>

                        {/* Skills */}
                        <div className="skills">
                            <h2>Skills Proficient At</h2>

                            <div className="skill-boxes">
                                {profileUser?.skillsProficientAt.map(
                                    (skill, index) => (
                                        <div
                                            className="skill-box"
                                            style={{ fontSize: "16px" }}
                                            key={index}
                                        >
                                            {skill}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="education">
                            <h2>Education</h2>

                            <div className="education-boxes">
                                {profileUser &&
                                    profileUser?.education &&
                                    profileUser?.education.map(
                                        (edu, index) => (
                                            <Box
                                                key={index}
                                                head={edu?.institution}
                                                date={
                                                    convertDate(
                                                        edu?.startDate
                                                    ) +
                                                    " - " +
                                                    convertDate(
                                                        edu?.endDate
                                                    )
                                                }
                                                spec={edu?.degree}
                                                desc={edu?.description}
                                                score={edu?.score}
                                            />
                                        )
                                    )}
                            </div>
                        </div>

                        {/* Projects */}
                        {profileUser?.projects &&
                            profileUser?.projects.length > 0 && (
                                <div className="projects">
                                    <h2>Projects</h2>

                                    <div className="project-boxes">
                                        {profileUser &&
                                            profileUser?.projects &&
                                            profileUser?.projects.map(
                                                (project, index) => (
                                                    <Box
                                                        key={index}
                                                        head={project?.title}
                                                        date={
                                                            convertDate(
                                                                project?.startDate
                                                            ) +
                                                            " - " +
                                                            convertDate(
                                                                project?.endDate
                                                            )
                                                        }
                                                        desc={
                                                            project?.description
                                                        }
                                                        skills={
                                                            project?.techStack
                                                        }
                                                    />
                                                )
                                            )}
                                    </div>
                                </div>
                            )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;