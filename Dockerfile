# ใช้ Node.js 22.12 เป็น base image
FROM node:22.12

# กำหนด working directory
WORKDIR /app

# รับ build argument สำหรับไฟล์ .env
ARG ENV_FILE_CONTENT
ARG NODE_ENV=production

# สร้างไฟล์ .env จาก build argument
RUN if [ -n "$ENV_FILE_CONTENT" ]; then \
      echo "$ENV_FILE_CONTENT" > .env; \
    else \
      echo "No ENV_FILE_CONTENT provided" > .env; \
    fi

# คัดลอกไฟล์ package.json และ package-lock.json ก่อน
COPY package.json package-lock.json ./

# เซ็ต NODE_ENV จาก argument
ENV NODE_ENV=$NODE_ENV

# ติดตั้ง dependencies ตามโหมดที่กำหนด
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --only=production; \
    else \
      npm ci; \
    fi

# ติดตั้ง dependencies เพิ่มเติมที่จำเป็น
RUN npm install node-cron pg --save

# คัดลอกโค้ดทั้งหมดไปยัง container
COPY . .

# สร้าง build ของ Strapi (ย้ายมาหลังจาก COPY เพื่อให้มีไฟล์ทั้งหมดก่อน build)
RUN npm run build

# กำหนดพอร์ตที่ใช้
EXPOSE 80

# คำสั่งสำหรับรัน Strapi
CMD ["npm", "start"]