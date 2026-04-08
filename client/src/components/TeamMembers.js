import React from "react";
import "./TeamMembers.css";

const TeamMembers = ({ theme }) => {
  const team = [
    {
      id: 1,
      name: "Anamika Chaturvedi",
      role: "Founder",
      image: "/team/anamika_chaturvedi.jpg",
    },
    {
      id: 2,
      name: "Atharva Chaturvedi",
      role: "Member",
      image: "/team/athu_pathu.jpg",
    },
    {
      id: 3,
      name: "Kriti Chaturvedi",
      role: "Member",
      image: "/team/kriti.jpg",
    },
  ];

  return (
    <div className="team-section py-4">
      <h2 className="text-center h3 mb-5" style={{ fontWeight: 600 }}>
        Our team
      </h2>
      <div className="row g-4 justify-content-center">
        {team.map((member) => (
          <div key={member.id} className="col-md-4 col-sm-6">
            <div
              className="team-card h-100"
              style={{
                backgroundColor: theme?.surface || theme?.cardBackground,
                color: theme?.text,
                border: `1px solid ${theme?.borderColor}`,
                boxShadow: `0 6px 24px ${theme?.shadow}`,
              }}
            >
              <img src={member.image} className="team-member-image" alt="" />
              <div className="team-member-details">
                <h5 className="team-member-name">{member.name}</h5>
                <p className="team-member-role mb-0">{member.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;
