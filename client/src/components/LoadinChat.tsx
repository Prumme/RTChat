const LoadinChat = () => {
  return (
    <main className="flex-1 flex flex-col justify-between p-8  rounded-r-lg">
      <div className="space-y-6 overflow-y-auto pr-4 w-full">
        <div className="flex justify-start gap-2 py-1">
          <div className="skeleton rounded-full h-10 w-10"></div>
          <div className="skeleton w-1/5 h-10"></div>
        </div>
        <div className="flex flex-row-reverse gap-2 py-1 w-full">
          <div className="skeleton rounded-full h-10 w-10"></div>
          <div className="skeleton w-1/3 h-10"></div>
        </div>
        <div className="flex justify-start gap-2 py-1">
          <div className="skeleton rounded-full h-10 w-10"></div>
          <div className="skeleton w-1/8 h-10"></div>
        </div>
        <div className="flex justify-start gap-2 py-1">
          <div className="skeleton rounded-full h-10 w-10"></div>
          <div className="skeleton w-1/3 h-10"></div>
        </div>
        <div className="flex flex-row-reverse gap-2 py-1 w-full">
          <div className="skeleton rounded-full h-10 w-10"></div>
          <div className="skeleton w-1/4 h-10"></div>
        </div>
        <div className="flex flex-row-reverse gap-2 py-1 w-full">
          <div className="skeleton rounded-full h-10 w-10"></div>
          <div className="skeleton w-1/6 h-10"></div>
        </div>
      </div>
      <form className="mt-6 flex items-center gap-3">
        <input
          type="text"
          placeholder="Écrire un message..."
          className="input input-bordered w-full rounded-lg"
        />
        <button className="btn btn-primary rounded-lg">Envoyer</button>
      </form>
    </main>
  );
};

export default LoadinChat;
